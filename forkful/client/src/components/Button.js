import React from 'react';
import { cn } from '../utils/cn';

const variants = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const Button = React.forwardRef(function Button(
  { variant = 'primary', className, children, type = 'button', ...rest },
  ref
) {
  return (
    <button ref={ref} type={type} className={cn(variants[variant] || variants.primary, className)} {...rest}>
      {children}
    </button>
  );
});

export default Button;
