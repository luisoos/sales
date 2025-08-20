'use client';

import type { MouseEventHandler, ReactNode } from 'react';
import { Dot } from '~/components/ui/foundations/dot-icon';
import { cx } from '~/utils/cx';
import type {
    BadgeColors,
    BadgeTypeToColorMap,
    BadgeTypes,
    FlagTypes,
    IconComponentType,
    Sizes,
} from './badge-types';
import { badgeTypes } from './badge-types';
import { X } from 'lucide-react';

export const filledColors: Record<
    BadgeColors,
    { root: string; addon: string; addonButton: string }
> = {
    gray: {
        root: 'bg-gray-50 text-gray-700 ring-gray-200',
        addon: 'text-gray-500',
        addonButton: 'hover:bg-gray-100 text-gray-400 hover:text-gray-500',
    },
    brand: {
        root: 'bg-brand/10 text-brand-dark ring-brand-light',
        addon: 'text-brand0',
        addonButton:
            'hover:bg-brand-dark/10 text-brand-light/90 hover:text-brand0',
    },
    error: {
        root: 'bg-red-50 text-red-700 ring-red-200',
        addon: 'text-red-500',
        addonButton: 'hover:bg-red-100 text-red-400 hover:text-red-500',
    },
    warning: {
        root: 'bg-red-50 text-red-700 ring-red-200',
        addon: 'text-red-500',
        addonButton: 'hover:bg-red-100 text-red-400 hover:text-red-500',
    },
    success: {
        root: 'bg-success-50 text-success-700 ring-success-200',
        addon: 'text-success-500',
        addonButton:
            'hover:bg-success-100 text-success-400 hover:text-success-500',
    },
    'gray-blue': {
        root: 'bg-gray-blue-50 text-gray-blue-700 ring-gray-blue-200',
        addon: 'text-gray-blue-500',
        addonButton:
            'hover:bg-gray-blue-100 text-gray-blue-400 hover:text-gray-blue-500',
    },
    'blue-light': {
        root: 'bg-blue-light-50 text-blue-light-700 ring-blue-light-200',
        addon: 'text-blue-light-500',
        addonButton:
            'hover:bg-blue-light-100 text-blue-light-400 hover:text-blue-light-500',
    },
    blue: {
        root: 'bg-blue-50 text-blue-700 ring-blue-200',
        addon: 'text-blue-500',
        addonButton: 'hover:bg-blue-100 text-blue-400 hover:text-blue-500',
    },
    indigo: {
        root: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
        addon: 'text-indigo-500',
        addonButton:
            'hover:bg-indigo-100 text-indigo-400 hover:text-indigo-500',
    },
    purple: {
        root: 'bg-purple-50 text-purple-700 ring-purple-200',
        addon: 'text-purple-500',
        addonButton:
            'hover:bg-purple-100 text-purple-400 hover:text-purple-500',
    },
    pink: {
        root: 'bg-pink-50 text-pink-700 ring-pink-200',
        addon: 'text-pink-500',
        addonButton: 'hover:bg-pink-100 text-pink-400 hover:text-pink-500',
    },
    orange: {
        root: 'bg-orange-50 text-orange-700 ring-orange-200',
        addon: 'text-orange-500',
        addonButton:
            'hover:bg-orange-100 text-orange-400 hover:text-orange-500',
    },
};

const addonOnlyColors = Object.fromEntries(
    Object.entries(filledColors).map(([key, value]) => [
        key,
        { root: '', addon: value.addon },
    ]),
) as Record<BadgeColors, { root: string; addon: string }>;

const withPillTypes = {
    [badgeTypes.pillColor]: {
        common: 'size-max flex items-center whitespace-nowrap rounded-full ring-1 ring-inset',
        styles: filledColors,
    },
    [badgeTypes.badgeColor]: {
        common: 'size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset',
        styles: filledColors,
    },
    [badgeTypes.badgeModern]: {
        common: 'size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset shadow-xs',
        styles: {
            gray: {
                root: 'bg-primary text-zinc-800 ring-zinc-200',
                addon: 'text-gray-500',
                addonButton:
                    'hover:bg-gray-100 text-gray-400 hover:text-gray-500',
            },
        },
    },
};

const withBadgeTypes = {
    [badgeTypes.pillColor]: {
        common: 'size-max flex items-center whitespace-nowrap rounded-full ring-1 ring-inset',
        styles: filledColors,
    },
    [badgeTypes.badgeColor]: {
        common: 'size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset',
        styles: filledColors,
    },
    [badgeTypes.badgeModern]: {
        common: 'size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset bg-primary text-zinc-800 ring-zinc-200 shadow-xs',
        styles: addonOnlyColors,
    },
};

export type BadgeColor<T extends BadgeTypes> = BadgeTypeToColorMap<
    typeof withPillTypes
>[T];

interface BadgeProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    color?: BadgeColor<T>;
    children: ReactNode;
    className?: string;
}

export const Badge = <T extends BadgeTypes>(props: BadgeProps<T>) => {
    const {
        type = 'pill-color',
        size = 'md',
        color = 'gray',
        children,
    } = props;
    const colors = withPillTypes[type];

    const pillSizes = {
        sm: 'py-0.5 px-2 text-xs font-medium',
        md: 'py-0.5 px-2.5 text-sm font-medium',
        lg: 'py-1 px-3 text-sm font-medium',
    };
    const badgeSizes = {
        sm: 'py-0.5 px-1.5 text-xs font-medium',
        md: 'py-0.5 px-2 text-sm font-medium',
        lg: 'py-1 px-2.5 text-sm font-medium rounded-lg',
    };

    const sizes = {
        [badgeTypes.pillColor]: pillSizes,
        [badgeTypes.badgeColor]: badgeSizes,
        [badgeTypes.badgeModern]: badgeSizes,
    };

    return (
        <span
            className={cx(
                colors.common,
                sizes[type][size],
                colors.styles[color].root,
                props.className,
            )}>
            {children}
        </span>
    );
};

interface BadgeWithDotProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    color?: BadgeTypeToColorMap<typeof withBadgeTypes>[T];
    className?: string;
    children: ReactNode;
}

export const BadgeWithDot = <T extends BadgeTypes>(
    props: BadgeWithDotProps<T>,
) => {
    const {
        size = 'md',
        color = 'gray',
        type = 'pill-color',
        className,
        children,
    } = props;

    const colors = withBadgeTypes[type];

    const pillSizes = {
        sm: 'gap-1 py-0.5 pl-1.5 pr-2 text-xs font-medium',
        md: 'gap-1.5 py-0.5 pl-2 pr-2.5 text-sm font-medium',
        lg: 'gap-1.5 py-1 pl-2.5 pr-3 text-sm font-medium',
    };

    const badgeSizes = {
        sm: 'gap-1 py-0.5 px-1.5 text-xs font-medium',
        md: 'gap-1.5 py-0.5 px-2 text-sm font-medium',
        lg: 'gap-1.5 py-1 px-2.5 text-sm font-medium rounded-lg',
    };

    const sizes = {
        [badgeTypes.pillColor]: pillSizes,
        [badgeTypes.badgeColor]: badgeSizes,
        [badgeTypes.badgeModern]: badgeSizes,
    };

    return (
        <span
            className={cx(
                colors.common,
                sizes[type][size],
                colors.styles[color].root,
                className,
            )}>
            <Dot className={colors.styles[color].addon} size='sm' />
            {children}
        </span>
    );
};

interface BadgeWithIconProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    color?: BadgeTypeToColorMap<typeof withBadgeTypes>[T];
    iconLeading?: IconComponentType;
    iconTrailing?: IconComponentType;
    children: ReactNode;
    className?: string;
}

export const BadgeWithIcon = <T extends BadgeTypes>(
    props: BadgeWithIconProps<T>,
) => {
    const {
        size = 'md',
        color = 'gray',
        type = 'pill-color',
        iconLeading: IconLeading,
        iconTrailing: IconTrailing,
        children,
        className,
    } = props;

    const colors = withBadgeTypes[type];

    const icon = IconLeading ? 'leading' : 'trailing';

    const pillSizes = {
        sm: {
            trailing: 'gap-0.5 py-0.5 pl-2 pr-1.5 text-xs font-medium',
            leading: 'gap-0.5 py-0.5 pr-2 pl-1.5 text-xs font-medium',
        },
        md: {
            trailing: 'gap-1 py-0.5 pl-2.5 pr-2 text-sm font-medium',
            leading: 'gap-1 py-0.5 pr-2.5 pl-2 text-sm font-medium',
        },
        lg: {
            trailing: 'gap-1 py-1 pl-3 pr-2.5 text-sm font-medium',
            leading: 'gap-1 py-1 pr-3 pl-2.5 text-sm font-medium',
        },
    };
    const badgeSizes = {
        sm: {
            trailing: 'gap-0.5 py-0.5 pl-2 pr-1.5 text-xs font-medium',
            leading: 'gap-0.5 py-0.5 pr-2 pl-1.5 text-xs font-medium',
        },
        md: {
            trailing: 'gap-1 py-0.5 pl-2 pr-1.5 text-sm font-medium',
            leading: 'gap-1 py-0.5 pr-2 pl-1.5 text-sm font-medium',
        },
        lg: {
            trailing: 'gap-1 py-1 pl-2.5 pr-2 text-sm font-medium rounded-lg',
            leading: 'gap-1 py-1 pr-2.5 pl-2 text-sm font-medium rounded-lg',
        },
    };

    const sizes = {
        [badgeTypes.pillColor]: pillSizes,
        [badgeTypes.badgeColor]: badgeSizes,
        [badgeTypes.badgeModern]: badgeSizes,
    };

    return (
        <span
            className={cx(
                colors.common,
                sizes[type][size][icon],
                colors.styles[color].root,
                className,
            )}>
            {IconLeading && (
                <IconLeading
                    className={cx(
                        colors.styles[color].addon,
                        'size-3 stroke-3',
                    )}
                />
            )}
            {children}
            {IconTrailing && (
                <IconTrailing
                    className={cx(
                        colors.styles[color].addon,
                        'size-3 stroke-3',
                    )}
                />
            )}
        </span>
    );
};

interface BadgeWithFlagProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    flag?: FlagTypes;
    color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
    children: ReactNode;
}

export const BadgeWithFlag = <T extends BadgeTypes>(
    props: BadgeWithFlagProps<T>,
) => {
    const {
        size = 'md',
        color = 'gray',
        flag = 'AU',
        type = 'pill-color',
        children,
    } = props;

    const colors = withPillTypes[type];

    const pillSizes = {
        sm: 'gap-1 py-0.5 pl-0.75 pr-2 text-xs font-medium',
        md: 'gap-1.5 py-0.5 pl-1 pr-2.5 text-sm font-medium',
        lg: 'gap-1.5 py-1 pl-1.5 pr-3 text-sm font-medium',
    };
    const badgeSizes = {
        sm: 'gap-1 py-0.5 pl-1 pr-1.5 text-xs font-medium',
        md: 'gap-1.5 py-0.5 pl-1.5 pr-2 text-sm font-medium',
        lg: 'gap-1.5 py-1 pl-2 pr-2.5 text-sm font-medium rounded-lg',
    };

    const sizes = {
        [badgeTypes.pillColor]: pillSizes,
        [badgeTypes.badgeColor]: badgeSizes,
        [badgeTypes.badgeModern]: badgeSizes,
    };

    return (
        <span
            className={cx(
                colors.common,
                sizes[type][size],
                colors.styles[color].root,
            )}>
            <img
                src={`https://www.untitledui.com/images/flags/${flag}.svg`}
                className='size-4 max-w-none rounded-full'
                alt={`${flag} flag`}
            />
            {children}
        </span>
    );
};

interface BadgeWithImageProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    imgSrc: string;
    color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
    children: ReactNode;
    className?: string;
}

export const BadgeWithImage = <T extends BadgeTypes>(
    props: BadgeWithImageProps<T>,
) => {
    const {
        size = 'md',
        color = 'gray',
        type = 'pill-color',
        imgSrc,
        children,
        className,
    } = props;

    const colors = withPillTypes[type];

    const pillSizes = {
        sm: 'gap-1 py-0.5 pl-0.75 pr-2 text-xs font-medium',
        md: 'gap-1.5 py-0.5 pl-1 pr-2.5 text-sm font-medium',
        lg: 'gap-1.5 py-1 pl-1.5 pr-3 text-sm font-medium',
    };
    const badgeSizes = {
        sm: 'gap-1 py-0.5 pl-1 pr-1.5 text-xs font-medium',
        md: 'gap-1.5 py-0.5 pl-1.5 pr-2 text-sm font-medium',
        lg: 'gap-1.5 py-1 pl-2 pr-2.5 text-sm font-medium rounded-lg',
    };

    const sizes = {
        [badgeTypes.pillColor]: pillSizes,
        [badgeTypes.badgeColor]: badgeSizes,
        [badgeTypes.badgeModern]: badgeSizes,
    };

    return (
        <span
            className={cx(
                colors.common,
                sizes[type][size],
                colors.styles[color].root,
                className,
            )}>
            <img
                src={imgSrc}
                className='size-4 max-w-none rounded-full'
                alt='Badge image'
            />
            {children}
        </span>
    );
};

interface BadgeWithButtonProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    icon?: IconComponentType;
    color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
    children: ReactNode;
    /**
     * The label for the button.
     */
    buttonLabel?: string;
    /**
     * The click event handler for the button.
     */
    onButtonClick?: MouseEventHandler<HTMLButtonElement>;
}

export const BadgeWithButton = <T extends BadgeTypes>(
    props: BadgeWithButtonProps<T>,
) => {
    const {
        size = 'md',
        color = 'gray',
        type = 'pill-color',
        icon: Icon = X,
        buttonLabel,
        children,
    } = props;

    const colors = withPillTypes[type];

    const pillSizes = {
        sm: 'gap-0.5 py-0.5 pl-2 pr-0.75 text-xs font-medium',
        md: 'gap-0.5 py-0.5 pl-2.5 pr-1 text-sm font-medium',
        lg: 'gap-0.5 py-1 pl-3 pr-1.5 text-sm font-medium',
    };
    const badgeSizes = {
        sm: 'gap-0.5 py-0.5 pl-1.5 pr-0.75 text-xs font-medium',
        md: 'gap-0.5 py-0.5 pl-2 pr-1 text-sm font-medium',
        lg: 'gap-0.5 py-1 pl-2.5 pr-1.5 text-sm font-medium rounded-lg',
    };

    const sizes = {
        [badgeTypes.pillColor]: pillSizes,
        [badgeTypes.badgeColor]: badgeSizes,
        [badgeTypes.badgeModern]: badgeSizes,
    };

    return (
        <span
            className={cx(
                colors.common,
                sizes[type][size],
                colors.styles[color].root,
            )}>
            {children}
            <button
                type='button'
                aria-label={buttonLabel}
                onClick={props.onButtonClick}
                className={cx(
                    'flex cursor-pointer items-center justify-center p-0.5 outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2',
                    colors.styles[color].addonButton,
                    type === 'pill-color' ? 'rounded-full' : 'rounded-[3px]',
                )}>
                <Icon className='size-3 stroke-[3px] transition-inherit-all' />
            </button>
        </span>
    );
};

interface BadgeIconProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    icon: IconComponentType;
    color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
    children?: ReactNode;
}

export const BadgeIcon = <T extends BadgeTypes>(props: BadgeIconProps<T>) => {
    const {
        size = 'md',
        color = 'gray',
        type = 'pill-color',
        icon: Icon,
    } = props;

    const colors = withPillTypes[type];

    const pillSizes = {
        sm: 'p-1.25',
        md: 'p-1.5',
        lg: 'p-2',
    };

    const badgeSizes = {
        sm: 'p-1.25',
        md: 'p-1.5',
        lg: 'p-2 rounded-lg',
    };

    const sizes = {
        [badgeTypes.pillColor]: pillSizes,
        [badgeTypes.badgeColor]: badgeSizes,
        [badgeTypes.badgeModern]: badgeSizes,
    };

    return (
        <span
            className={cx(
                colors.common,
                sizes[type][size],
                colors.styles[color].root,
            )}>
            <Icon
                className={cx(
                    'size-3 stroke-[3px]',
                    colors.styles[color].addon,
                )}
            />
        </span>
    );
};
