import cn from 'classnames';
import Text from '@/components/ui/text';

const classes = {
  base: 'absolute top-0 bottom-0 left-0 h-full flex items-center justify-center',
  size: {
    sm: 'h-1.5',
    DEFAULT: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  },
  rounded: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    DEFAULT: 'rounded-full',
  },
  variant: {
    solid: {
      base: 'text-gray-0',
      color: {
        DEFAULT: 'bg-gray-900',
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        danger: 'bg-red',
        info: 'bg-blue',
        success: 'bg-green',
        warning: 'bg-orange',
      },
    },
    flat: {
      base: '',
      color: {
        DEFAULT: 'bg-gray-400/50',
        primary: 'bg-primary-light/40 text-primary-dark',
        secondary: 'bg-secondary-light/40 text-secondary-dark',
        danger: 'bg-red-light/40 text-red-dark',
        info: 'bg-blue-light/40 text-blue-dark',
        success: 'bg-green-light/40 text-green-dark',
        warning: 'bg-orange-light/40 text-orange-dark',
      },
    },
  },
};

export interface ProgressbarProps {
  /** Percentage of filled bar */
  value?: number;
  /** Pass label to show percentage inside bar */
  label?: React.ReactNode;
  /** Size of the compoents are: */
  size?: keyof typeof classes.size;
  /** The rounded variants are: */
  rounded?: keyof typeof classes.rounded;
  /** Pass color variations */
  color?: keyof typeof classes.variant.flat.color;
  /** The variants of the components are: */
  variant?: keyof typeof classes.variant;
  /** To style entire progressbar component */
  className?: string;
  /** To style bar of the component */
  barClassName?: string;
  /** To style label */
  labelClassName?: string;
}

const Progressbar = ({
  value,
  label = '',
  size = 'DEFAULT',
  rounded = 'DEFAULT',
  color = 'DEFAULT',
  variant = 'solid',
  className,
  barClassName,
  labelClassName,
}: ProgressbarProps) => (
  <div
    className={cn(
      'relative w-full bg-gray-200',
      classes.size[size],
      classes.rounded[rounded],
      className
    )}
  >
    {/* @ts-ignore */}
    <div
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      aria-label={label}
      className={cn(
        classes.base,
        classes.variant[variant].base,
        classes.variant[variant].color[color],
        classes.rounded[rounded],
        barClassName
      )}
      style={{ width: `${value}%` }}
    >
      {label && size === 'xl' && (
        <Text className={cn('text-xs font-bold', labelClassName)}>{label}</Text>
      )}
    </div>
  </div>
);

Progressbar.displayName = 'Progressbar';
export default Progressbar;
