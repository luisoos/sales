'use client';

import { ArrowRight } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { isValidElement } from 'react';
import { cx, sortCx } from '~/utils/cx';
import { isReactComponent } from '~/utils/is-react-component';

type Size = 'sm' | 'md' | 'lg';
type Color = 'brand' | 'warning' | 'error' | 'gray' | 'success';
type Theme = 'light' | 'modern';
type Align = 'leading' | 'trailing';

const baseClasses: Record<
    Theme,
    { root?: string; addon?: string; icon?: string }
> = {
    light: {
        root: 'rounded-full ring-1 ring-inset',
        addon: 'rounded-full ring-1 ring-inset',
    },
    modern: {
        root: 'rounded-md bg-primary text-zinc-800 shadow-xs ring-1 ring-inset ring-zinc-200 hover:bg-secondary',
        addon: 'flex items-center rounded-sm bg-primary shadow-xs ring-1 ring-inset ring-zinc-200',
        icon: 'text-zinc-800',
    },
};

const getSizeClasses = (
    theme?: Theme,
    text?: boolean,
    icon?: boolean,
): Record<
    Align,
    Record<Size, { root?: string; addon?: string; icon?: string; dot?: string }>
> => ({
    leading: {
        sm: {
            root: cx(
                'py-0.5 pr-2 text-xs font-medium',
                !text && !icon && 'pr-1',
            ),
            addon: cx(
                'px-1 ml-0.5',
                theme === 'modern' && 'gap-1 px-1',
                text && 'mr-1',
            ),
            icon: 'ml-0.5 size-2',
        },
        md: {
            root: cx(
                'py-1 pr-2 pl-1 text-xs font-medium',
                !text && !icon && 'pr-1',
            ),
            addon: cx(
                'px-2 py-0.5',
                theme === 'modern' && 'gap-1 px-1.5',
                text && 'mr-2',
            ),
            icon: 'ml-1 size-4',
        },
        lg: {
            root: cx(
                'py-1 pr-2 pl-1 text-sm font-medium',
                !text && !icon && 'pr-1',
            ),
            addon: cx(
                'px-2.5 py-0.5',
                theme === 'modern' && 'gap-1.5 px-2',
                text && 'mr-2',
            ),
            icon: 'ml-1 size-4',
        },
    },
    trailing: {
        sm: {
            root: cx(
                'pr-1 pl-0.5 text-xs font-medium',
                !text && !icon && 'pr-1.5',
            ),
            addon: cx(
                'px-1 py-0.5',
                theme === 'modern' && 'gap-1 px-1',
                text && 'mr-1',
            ),
            icon: 'ml-0.5 size-2',
        },
        md: {
            root: cx(
                'py-1 pr-1 pl-3 text-xs font-medium',
                theme === 'modern' && 'pl-2.5',
            ),
            addon: cx(
                'py-0.5 pr-1.5 pl-2',
                theme === 'modern' && 'pr-1.5 pl-2',
                text && 'ml-2',
            ),
            icon: 'ml-0.5 size-3 stroke-[3px]',
            dot: 'mr-1.5',
        },
        lg: {
            root: 'py-1 pr-1 pl-3 text-sm font-medium',
            addon: cx(
                'py-0.5 pr-2 pl-2.5',
                theme === 'modern' && 'pr-1.5 pl-2',
                text && 'ml-2',
            ),
            icon: 'ml-1 size-3 stroke-[3px]',
            dot: 'mr-2',
        },
    },
});

const colorClasses: Record<
    Theme,
    Record<
        Color,
        { root?: string; addon?: string; icon?: string; dot?: string }
    >
> = sortCx({
    light: {
        brand: {
            root: 'bg-brand/10 text-brand-dark ring-brand hover:bg-brand/30',
            addon: 'bg-primary text-current ring-brand',
            icon: 'text-brand',
        },
        gray: {
            root: 'bg-zinc-50 text-zinc-700 ring-zinc-200 hover:bg-zinc-100',
            addon: 'bg-primary text-current ring-zinc-200',
            icon: 'text-zinc-500',
        },
        error: {
            root: 'bg-red-50 text-red-700 ring-red-200 hover:bg-red-100',
            addon: 'bg-primary text-current ring-red-200',
            icon: 'text-red-500',
        },
        warning: {
            root: 'bg-orange-50 text-orange-700 ring-orange-200 hover:bg-orange-100',
            addon: 'bg-primary text-current ring-orange-200',
            icon: 'text-orange-500',
        },
        success: {
            root: 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100',
            addon: 'bg-primary text-current ring-green-200',
            icon: 'text-green-500',
        },
    },
    modern: {
        brand: {
            dot: 'bg-brand outline-3 -outline-offset-1 outline-brand/50',
        },
        gray: {
            dot: 'bg-zinc-500 outline-3 -outline-offset-1 outline-zinc-100',
        },
        error: {
            dot: 'bg-red-500 outline-3 -outline-offset-1 outline-red-100',
        },
        warning: {
            dot: 'bg-orange-500 outline-3 -outline-offset-1 outline-orange-100',
        },
        success: {
            dot: 'bg-green-500 outline-3 -outline-offset-1 outline-green-100',
        },
    },
});

interface BadgeGroupProps {
    children?: string | ReactNode;
    addonText: string;
    size?: Size;
    color: Color;
    theme?: Theme;
    /**
     * Alignment of the badge addon element.
     */
    align?: Align;
    iconTrailing?: FC<{ className?: string }> | ReactNode;
    className?: string;
}

export const BadgeGroup = ({
    children,
    addonText,
    size = 'md',
    color = 'brand',
    theme = 'light',
    align = 'leading',
    className,
    iconTrailing: IconTrailing,
}: BadgeGroupProps) => {
    const colors = colorClasses[theme][color];
    const sizes = getSizeClasses(theme, !!children, !!IconTrailing)[align][
        size
    ];

    const rootClasses = cx(
        'inline-flex w-max cursor-pointer items-center transition duration-100 ease-linear',
        baseClasses[theme].root,
        sizes.root,
        colors.root,
        className,
    );
    const addonClasses = cx(
        'inline-flex items-center',
        baseClasses[theme].addon,
        sizes.addon,
        colors.addon,
    );
    const dotClasses = cx(
        'inline-block size-2 shrink-0 rounded-full',
        sizes.dot,
        colors.dot,
    );
    const iconClasses = cx(baseClasses[theme].icon, sizes.icon, colors.icon);

    if (align === 'trailing') {
        return (
            <div className={rootClasses}>
                {theme === 'modern' && <span className={dotClasses} />}

                {children}

                <span className={addonClasses}>
                    {addonText}

                    {/* Trailing icon */}
                    {isReactComponent(IconTrailing) && (
                        <IconTrailing className={iconClasses} />
                    )}
                    {isValidElement(IconTrailing) && IconTrailing}
                </span>
            </div>
        );
    }

    return (
        <div className={rootClasses}>
            <span className={addonClasses}>
                {theme === 'modern' && <span className={dotClasses} />}
                {addonText}
            </span>

            {children}

            {/* Trailing icon */}
            {isReactComponent(IconTrailing) && (
                <IconTrailing className={iconClasses} />
            )}
            {isValidElement(IconTrailing) && IconTrailing}
        </div>
    );
};
