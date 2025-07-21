<?php
/**
 * Plugin Name: AC WP Hamburger Menu
 * Description: A floating hamburger menu with iOS-style animations using GSAP
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: ac-wp-ham-menu
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Include installation script
require_once plugin_dir_path(__FILE__) . 'install.php';

class AC_WP_Ham_Menu {
    
    private $plugin_url;
    private $plugin_path;
    
    public function __construct() {
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->plugin_path = plugin_dir_path(__FILE__);
        
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'settings_init'));
        
        // Register shortcode
        add_shortcode('ac_wp_ham_menu', array($this, 'render_shortcode'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_scripts() {
        // Check if shortcode is being used in current post or widgets
        global $post;
        $should_enqueue = false;
        
        // Check post content
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'ac_wp_ham_menu')) {
            $should_enqueue = true;
        }
        
        // Check if we're in admin or if shortcode might be in widgets/customizer
        if (is_admin() || is_customize_preview()) {
            $should_enqueue = true;
        }
        
        // Always enqueue on pages where shortcode might be used dynamically
        if (is_front_page() || is_home() || is_page()) {
            // Check if any widgets contain the shortcode
            $sidebars = wp_get_sidebars_widgets();
            foreach ($sidebars as $sidebar => $widgets) {
                if (is_array($widgets)) {
                    foreach ($widgets as $widget) {
                        $widget_content = get_option('widget_' . $widget);
                        if (is_array($widget_content)) {
                            foreach ($widget_content as $instance) {
                                if (is_array($instance) && isset($instance['text'])) {
                                    if (has_shortcode($instance['text'], 'ac_wp_ham_menu')) {
                                        $should_enqueue = true;
                                        break 3;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if ($should_enqueue) {
            // Enqueue GSAP from CDN
            wp_enqueue_script(
                'gsap',
                'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
                array(),
                '3.12.2',
                true
            );
            
            // Enqueue plugin CSS
            wp_enqueue_style(
                'ac-wp-ham-menu-css',
                $this->plugin_url . 'assets/style.css',
                array(),
                '1.0.0'
            );
            
            // Enqueue plugin JS
            wp_enqueue_script(
                'ac-wp-ham-menu-js',
                $this->plugin_url . 'assets/script.js',
                array('gsap'),
                '1.0.0',
                true
            );
        }
    }
    
    public function add_admin_menu() {
        add_options_page(
            'AC WP Hamburger Menu',
            'AC WP Hamburger Menu',
            'manage_options',
            'ac-wp-ham-menu',
            array($this, 'options_page')
        );
    }
    
    public function settings_init() {
        register_setting('ac_wp_ham_menu', 'ac_wp_ham_menu_settings');
        
        add_settings_section(
            'ac_wp_ham_menu_section',
            __('Menu Settings', 'ac-wp-ham-menu'),
            array($this, 'settings_section_callback'),
            'ac_wp_ham_menu'
        );
        
        add_settings_field(
            'selected_menu',
            __('Select Menu', 'ac-wp-ham-menu'),
            array($this, 'menu_select_render'),
            'ac_wp_ham_menu',
            'ac_wp_ham_menu_section'
        );
    }
    
    public function settings_section_callback() {
        echo __('Choose which WordPress menu to display in the hamburger menu.', 'ac-wp-ham-menu');
    }
    
    public function menu_select_render() {
        $options = get_option('ac_wp_ham_menu_settings');
        $menus = wp_get_nav_menus();
        ?>
        <select name='ac_wp_ham_menu_settings[selected_menu]'>
            <option value=''><?php _e('Select a menu...', 'ac-wp-ham-menu'); ?></option>
            <?php foreach ($menus as $menu): ?>
                <option value='<?php echo $menu->term_id; ?>' <?php selected($options['selected_menu'] ?? '', $menu->term_id); ?>>
                    <?php echo $menu->name; ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php
    }
    
    public function options_page() {
        ?>
        <form action='options.php' method='post'>
            <h1>AC WP Hamburger Menu Settings</h1>
            <?php
            settings_fields('ac_wp_ham_menu');
            do_settings_sections('ac_wp_ham_menu');
            submit_button();
            ?>
        </form>
        <?php
    }
    
    public function render_shortcode($atts) {
        $options = get_option('ac_wp_ham_menu_settings');
        $selected_menu = $options['selected_menu'] ?? '';
        
        // If no menu selected, return nothing
        if (empty($selected_menu)) {
            return '';
        }
        
        // Generate unique ID for this instance
        $instance_id = 'ac-wp-ham-menu-' . uniqid();
        
        ob_start();
        ?>
        <div class="ac-wp-ham-container" id="<?php echo $instance_id; ?>">
            <button class="ac-wp-ham-toggle" aria-label="Toggle Menu" aria-expanded="false">
                <span class="ac-wp-ham-icon">
                    <span class="ac-wp-ham-line"></span>
                    <span class="ac-wp-ham-line"></span>
                    <span class="ac-wp-ham-line"></span>
                </span>
            </button>
            
            <nav class="ac-wp-ham-menu" role="navigation" aria-hidden="true">
                <div class="ac-wp-ham-menu-inner">
                    <?php
                    wp_nav_menu(array(
                        'menu' => $selected_menu,
                        'container' => false,
                        'menu_class' => 'ac-wp-ham-nav-list',
                        'walker' => new AC_WP_Ham_Menu_Walker(),
                        'fallback_cb' => false
                    ));
                    ?>
                </div>
            </nav>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Custom Walker for nested menu support
class AC_WP_Ham_Menu_Walker extends Walker_Nav_Menu {
    
    function start_lvl(&$output, $depth = 0, $args = null) {
        $indent = str_repeat("\t", $depth);
        $output .= "\n$indent<ul class=\"ac-wp-ham-submenu ac-wp-ham-submenu-level-$depth\">\n";
    }
    
    function end_lvl(&$output, $depth = 0, $args = null) {
        $indent = str_repeat("\t", $depth);
        $output .= "$indent</ul>\n";
    }
    
    function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
        $indent = ($depth) ? str_repeat("\t", $depth) : '';
        
        $classes = empty($item->classes) ? array() : (array) $item->classes;
        $classes[] = 'menu-item-' . $item->ID;
        
        $class_names = join(' ', apply_filters('nav_menu_css_class', array_filter($classes), $item, $args));
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';
        
        $id = apply_filters('nav_menu_item_id', 'menu-item-' . $item->ID, $item, $args);
        $id = $id ? ' id="' . esc_attr($id) . '"' : '';
        
        $has_children = in_array('menu-item-has-children', $classes);
        
        $output .= $indent . '<li' . $id . $class_names .'>';
        
        $attributes = ! empty($item->attr_title) ? ' title="'  . esc_attr($item->attr_title) .'"' : '';
        $attributes .= ! empty($item->target)     ? ' target="' . esc_attr($item->target     ) .'"' : '';
        $attributes .= ! empty($item->xfn)        ? ' rel="'    . esc_attr($item->xfn        ) .'"' : '';
        $attributes .= ! empty($item->url)        ? ' href="'   . esc_attr($item->url        ) .'"' : '';
        
        $item_output = isset($args->before) ? $args->before : '';
        $item_output .= '<a' . $attributes . '>';
        $item_output .= (isset($args->link_before) ? $args->link_before : '') . apply_filters('the_title', $item->title, $item->ID) . (isset($args->link_after) ? $args->link_after : '');
        
        if ($has_children) {
            $item_output .= '<span class="ac-wp-ham-submenu-arrow" aria-hidden="true">›</span>';
        }
        
        $item_output .= '</a>';
        $item_output .= isset($args->after) ? $args->after : '';
        
        $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
    }
    
    function end_el(&$output, $item, $depth = 0, $args = null) {
        $output .= "</li>\n";
    }
}

// Initialize the plugin
new AC_WP_Ham_Menu();