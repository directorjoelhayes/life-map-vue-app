export default {
  // Search functionality
  placeholder: {
    type: String,
    default: 'Search...',
    show: true
  },
  loading: {
    type: Boolean,
    default: false,
    show: true
  },
  value: {
    type: String,
    default: '',
    show: true
  },
  autofocus: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false,
    show: true
  },
  clearable: {
    type: Boolean,
    default: true
  },
  
  // Visual customization
  size: {
    type: String,
    default: 'default',
    validator: value => ['small', 'default', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: value => ['default', 'filled', 'outlined', 'minimal'].includes(value)
  },
  rounded: {
    type: Boolean,
    default: false
  },
  
  // Icon configuration
  showSearchIcon: {
    type: Boolean,
    default: true
  },
  customSearchIcon: {
    type: String,
    default: null
  },
  iconPosition: {
    type: String,
    default: 'left',
    validator: value => ['left', 'right'].includes(value)
  },
  
  // Advanced features
  debounce: {
    type: Number,
    default: 300
  },

  suggestions: {
    type: Array,
    default: () => []
  },
  showSuggestions: {
    type: Boolean,
    default: false
  },
  
  // A11y attributes
  ariaLabel: {
    type: String,
    default: 'Search'
  }
}