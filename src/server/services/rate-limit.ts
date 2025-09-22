import { Limit, RateLimiterCheck, RateWindow } from '~/types/rate-limit';

export class RateLimiter {
    private limits: Record<string, Limit>;
    private dataStorage = new Map<string, Record<string, RateWindow>>();

    constructor(limits: Record<string, Limit>) {
        this.limits = limits;
    }

    checkIp(ip: string): RateLimiterCheck {
        const now = Date.now();
        const dataStorageEntry: Record<string, RateWindow> =
            this.dataStorage.get(ip) ?? {};

        for (const limit of Object.entries(this.limits)) {
            let record = dataStorageEntry[limit[0]];
            const maxRequestsAllowed = limit[1].max;
            const timeWindow = limit[1].window;

            if (!record || record.expires <= now) {
                record = {
                    count: 1,
                    expires: now + timeWindow,
                };
                dataStorageEntry[limit[0]] = record; // zurück in den Container
                this.dataStorage.set(ip, dataStorageEntry);
                continue;
            }

            record.count++;

            if (record.count > maxRequestsAllowed) {
                this.dataStorage.set(ip, dataStorageEntry);
                return { limited: true, limit };
            }
        }

        this.dataStorage.set(ip, dataStorageEntry);
        return { limited: false };
    }
}
