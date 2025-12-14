import PropTypes from 'prop-types';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    required = false,
    error = '',
    name = '',
    className = ''
}) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label className="block text-gray-700 font-medium mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
            />
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string
};

export default Input;
