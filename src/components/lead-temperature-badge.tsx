import { type leadTemperature } from '~/types/lessons';
import { cn, ucfirst } from '~/lib/utils';
import { BadgeWithDot } from '~/components/ui/base/badges/badges';

export function LeadTemperatureBadge({
    leadTemperature,
    className,
}: {
    leadTemperature: leadTemperature;
    className?: string;
}) {
    function getTemperatureColor(temperature: leadTemperature) {
        switch (temperature) {
            case 'warm':
                return 'warning';
            case 'mixed':
                return 'orange';
            case 'cold':
                return 'blue';
            case 'hostile':
                return 'gray';
        }
    }

    return (
        <BadgeWithDot
            type='modern'
            color={getTemperatureColor(leadTemperature)}
            size='sm'
            className={cn(className)}>
            {ucfirst(leadTemperature)}
        </BadgeWithDot>
    );
}
