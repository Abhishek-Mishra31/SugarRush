import PropTypes from 'prop-types';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    className = '',
    type = 'button'
}) => {
    const baseClasses = 'px-6 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
    };

    const buttonClass = `${baseClasses} ${variantClasses[disabled ? 'disabled' : variant]} ${className}`;

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'disabled']),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;
