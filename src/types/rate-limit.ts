export type RateWindow = {
    count: number;
    expires: number;
};

export type Limit = {
    max: number;
    window: number;
};

export type RateLimiterCheck =
    | {
          limited: true;
          limit: [string, Limit];
      }
    | {
          limited: false;
      };
