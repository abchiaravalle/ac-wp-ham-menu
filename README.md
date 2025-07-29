# AC WP Hamburger Menu

A WordPress plugin that creates beautiful, iOS-style floating hamburger menus with smooth CSS animations.

## Features

- **🎯 Floating Design**: Clean, modern hamburger menu that floats over your content
- **⚡ CSS Animations**: Smooth, staggered animations with slide effects
- **📱 Mobile Responsive**: Adaptive design that works perfectly on all devices
- **♿ Accessible**: Full keyboard navigation and screen reader support
- **🎨 Customizable**: Easy to style and integrate with any theme
- **🔧 WordPress Integration**: Uses WordPress native menu system
- **⚡ Lightweight**: Pure CSS animations for optimal performance
- **🌐 Multi-level Support**: Unlimited nested submenu levels
- **🎯 Smart Positioning**: Automatically adjusts position based on viewport

## Quick Start

1. **Install the Plugin**
   ```bash
   # Upload to /wp-content/plugins/ or install via WordPress admin
   ```

2. **Create a WordPress Menu**
   - Go to Appearance → Menus
   - Create or select a menu
   - Add your menu items

3. **Configure the Plugin**
   - Go to Settings → AC WP Hamburger Menu
   - Select your menu from the dropdown
   - Save settings

4. **Add to Your Site**
   ```php
   // Add anywhere in your theme
   echo do_shortcode('[ac_wp_ham_menu]');
   ```

## Installation

### Method 1: WordPress Admin
1. Download the plugin ZIP file
2. Go to Plugins → Add New → Upload Plugin
3. Upload the ZIP file and activate

### Method 2: Manual Installation
1. Extract the plugin to `/wp-content/plugins/ac-wp-ham-menu/`
2. Activate through the Plugins menu in WordPress

### Method 3: Git Clone
```bash
cd /path/to/wordpress/wp-content/plugins/
git clone https://github.com/yourusername/ac-wp-ham-menu.git
```

## Usage

### Basic Usage
```php
// Simple shortcode
echo do_shortcode('[ac_wp_ham_menu]');
```

### Template Integration
```php
// In your theme files
if (function_exists('do_shortcode')) {
    echo do_shortcode('[ac_wp_ham_menu]');
}
```

### Widget Areas
You can also add the shortcode to any widget area that supports shortcodes.

## Configuration

### Plugin Settings
Navigate to **Settings → AC WP Hamburger Menu** to configure:

- **Select Menu**: Choose which WordPress menu to display
- The plugin will automatically handle the rest!

### Menu Setup
1. **Create Menu Items**: Go to Appearance → Menus
2. **Add Items**: Pages, posts, custom links, categories, etc.
3. **Nested Menus**: Drag items to create sub-menus (unlimited levels)
4. **Save Menu**: Don't forget to save your menu structure

## Technical Details

### Dependencies
- **WordPress**: 5.0 or higher
- **PHP**: 7.4 or higher
- **CSS**: Modern browser support for CSS transitions
- CDN-loaded CSS animations for better caching

### Performance
- **Lightweight**: Minimal JavaScript footprint
- **CSS-based**: Hardware-accelerated animations
- **Optimized**: Smart loading and caching strategies
- **Mobile-first**: Responsive design principles

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## Styling & Customization

### CSS Variables
The plugin uses scoped CSS classes to prevent conflicts:

```css
.ac-wp-ham-container {
    /* Main container */
}

.ac-wp-ham-toggle {
    /* Toggle button */
}

.ac-wp-ham-menu {
    /* Menu dropdown */
}

.ac-wp-ham-nav-list {
    /* Menu list */
}

.ac-wp-ham-submenu {
    /* Submenu containers */
}
```

### Custom Styling
Add your custom CSS to override default styles:

```css
/* Example: Change menu colors */
.ac-wp-ham-container .ac-wp-ham-menu {
    background: #your-color;
}

.ac-wp-ham-container .ac-wp-ham-nav-list a {
    color: #your-text-color;
}
```

## Features in Detail

### Animations
- **Menu Opening**: Smooth scale and fade animation
- **Menu Items**: Staggered slide-in effects
- **Submenus**: Smooth reveal with positioning
- **Hover Effects**: Subtle interactive feedback

### Accessibility
- **Keyboard Navigation**: Full arrow key support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Logical tab order
- **High Contrast**: Supports high contrast mode

### Mobile Experience
- **Touch Friendly**: Large touch targets
- **Responsive Design**: Adapts to all screen sizes
- **Performance**: Optimized for mobile devices
- **Native Feel**: iOS-style interactions

## Troubleshooting

### Common Issues

**Menu not appearing?**
1. Check that you've selected a menu in plugin settings
2. Verify the shortcode is placed correctly
3. Ensure the menu has items added to it

**Styling conflicts?**
1. All styles are scoped to prevent conflicts
2. Check for theme CSS that might override
3. Use browser dev tools to inspect elements

**JavaScript errors?**
1. Check browser console for errors
2. Verify WordPress and plugin are up to date
3. Test with default theme to isolate conflicts

### Debug Mode
Enable WordPress debug mode to see detailed error messages:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Changelog

### Version 1.0.0
- ✅ Initial release
- ✅ CSS-based animations
- ✅ WordPress menu integration
- ✅ Mobile responsive design
- ✅ Accessibility features
- ✅ Multi-level submenu support

## Support

- **Documentation**: Check this README for detailed information
- **Issues**: Report bugs via GitHub issues
- **WordPress**: Compatible with WordPress 5.0+

## License

This project is licensed under the GPL v2 or later.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Made with ❤️ for the WordPress community**