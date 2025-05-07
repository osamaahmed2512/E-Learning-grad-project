import PropTypes from 'prop-types';

const Button = ({ title, icon, activeClass, _callback, disabled = false }) => {
    return (
        <button 
            className={`px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-semibold rounded-lg
                       transition-all duration-200 shadow-sm cursor-pointer
                       flex items-center justify-center gap-1.5 md:gap-2 w-full
                       hover:shadow-md active:shadow-sm active:transform active:scale-95
                       ${activeClass === 'active-label' 
                         ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800' 
                         : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'}
                       ${disabled ? 'opacity-50 cursor-not-allowed hover:shadow-none active:transform-none' : ''}`}
            onClick={_callback}
            disabled={disabled}
        >
            {icon && <span className="text-base md:text-lg">{icon}</span>}
            <span className="whitespace-nowrap">{title}</span>
        </button>
    );
};

Button.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node,
    activeClass: PropTypes.string,
    _callback: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

export default Button;