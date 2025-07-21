# AC WP Hamburger Menu

A WordPress plugin that creates beautiful, iOS-style floating hamburger menus with GSAP animations.

## Features

- **🎨 iOS-Style Design**: Modern, elegant floating menu with backdrop blur effects
- **⚡ GSAP Animations**: Smooth, staggered animations with flip and slide effects
- **📱 Responsive**: Works perfectly on desktop and mobile devices
- **♿ Accessible**: Full keyboard navigation and ARIA attributes
- **🎯 Smart Positioning**: Automatically adjusts position to stay within viewport
- **🔧 WordPress Integration**: Uses native WordPress menus and walker
- **🎛️ Admin Settings**: Easy configuration through WordPress admin
- **🏗️ Theme Agnostic**: Works with any WordPress theme

## Installation

1. Upload the `ac-wp-ham-menu` folder to your `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to **Settings > AC WP Hamburger Menu** to configure your menu
4. Use the `[ac_wp_ham_menu]` shortcode where you want the menu to appear

## Usage

### Basic Usage

```php
echo do_shortcode('[ac_wp_ham_menu]');
```

### In Templates

```php
<?php echo do_shortcode('[ac_wp_ham_menu]'); ?>
```

### In Gutenberg/Block Editor

Simply add a Shortcode block and enter: `[ac_wp_ham_menu]`

## Configuration

1. Navigate to **Settings > AC WP Hamburger Menu** in your WordPress admin
2. Select which WordPress menu you want to display
3. Save your settings
4. The shortcode will now render your selected menu

**Note**: If no menu is selected, the shortcode will output nothing.

## Features in Detail

### Animations

- **Menu Open/Close**: Subtle scale and fade with 3D rotation
- **Menu Items**: Staggered slide-in from alternating sides (left/right)
- **Submenus**: Smooth slide and flip transitions
- **Hamburger Icon**: Morphs into X when menu is open

### Accessibility

- Full keyboard navigation with arrow keys
- ESC key closes the menu
- Proper ARIA attributes for screen readers
- Focus management for better UX
- High contrast mode support
- Respects `prefers-reduced-motion` setting

### Smart Positioning

The menu automatically detects viewport edges and adjusts its position:
- **Right Edge**: Menu opens to the left
- **Bottom Edge**: Menu opens upward
- **Corner Cases**: Handles both horizontal and vertical constraints

### Responsive Design

- Mobile-optimized sizing and spacing
- Touch-friendly interactive elements
- Viewport-aware maximum widths
- Smooth scrolling for long menus

## Technical Details

### Dependencies

- **GSAP**: Loaded from CDN (v3.12.2)
- **WordPress**: Minimum version 5.0
- **PHP**: Minimum version 7.4

### Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### Performance

- Scripts only load when shortcode is present on the page
- Lightweight CSS (~8KB)
- Optimized JavaScript (~12KB)
- CDN-loaded GSAP for better caching

## Customization

### CSS Classes

All styles are prefixed with `ac-wp-ham-` to prevent conflicts:

- `.ac-wp-ham-container` - Main wrapper
- `.ac-wp-ham-toggle` - Hamburger button
- `.ac-wp-ham-menu` - Menu container
- `.ac-wp-ham-nav-list` - Navigation list
- `.ac-wp-ham-submenu` - Submenu container

### Custom Styling

Add custom CSS to your theme to override default styles:

```css
.ac-wp-ham-toggle {
    background-color: #your-color !important;
}

.ac-wp-ham-menu {
    border-radius: 20px !important;
}
```

### JavaScript API

The plugin exposes a global object for external control:

```javascript
// Close all open menus
ACWPHamMenu.closeAll();
```

## File Structure

```
ac-wp-ham-menu/
├── ac-wp-ham-menu.php    # Main plugin file
├── assets/
│   ├── style.css         # Plugin styles
│   └── script.js         # Plugin JavaScript
└── README.md             # This file
```

## WordPress Integration

### Menu Walker

The plugin uses a custom walker (`AC_WP_Ham_Menu_Walker`) that extends WordPress's native `Walker_Nav_Menu` to:
- Add proper submenu classes
- Include submenu arrows
- Support nested menu structures
- Maintain WordPress menu functionality

### Settings API

Uses WordPress Settings API for:
- Proper option storage
- Admin interface generation
- Security and validation
- Translation readiness

## Troubleshooting

### Menu Not Appearing

1. Check that a menu is selected in **Settings > AC WP Hamburger Menu**
2. Verify the shortcode is correctly placed: `[ac_wp_ham_menu]`
3. Ensure the selected menu has menu items

### Animations Not Working

1. Check browser console for JavaScript errors
2. Verify GSAP is loading from CDN
3. Ensure no other plugins are conflicting

### Styling Issues

1. Check for CSS conflicts with your theme
2. Use browser developer tools to inspect elements
3. Add `!important` to custom styles if needed

## Support

For support, please:
1. Check this README for common solutions
2. Review browser console for errors
3. Test with default WordPress theme to isolate conflicts

## Changelog

### 1.0.0
- Initial release
- iOS-style floating menu design
- GSAP animations with stagger effects
- Full accessibility support
- Viewport-aware positioning
- WordPress admin integration

## License

This plugin is released under the GPL v2 or later license.