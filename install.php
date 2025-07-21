<?php
/**
 * AC WP Hamburger Menu Installation Script
 * Runs on plugin activation
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AC_WP_Ham_Menu_Installer {
    
    public static function activate() {
        // Create default options
        $default_options = array(
            'selected_menu' => '',
            'version' => '1.0.0'
        );
        
        // Add default options if they don't exist
        if (!get_option('ac_wp_ham_menu_settings')) {
            add_option('ac_wp_ham_menu_settings', $default_options);
        }
        
        // Set activation flag for admin notice
        set_transient('ac_wp_ham_menu_activated', true, 30);
        
        // Clear any existing caches
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
    }
    
    public static function deactivate() {
        // Clean up transients
        delete_transient('ac_wp_ham_menu_activated');
        
        // Clear any existing caches
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
    }
    
    public static function uninstall() {
        // Only remove data if user chooses to delete plugin data
        if (defined('WP_UNINSTALL_PLUGIN')) {
            // Remove plugin options
            delete_option('ac_wp_ham_menu_settings');
            
            // Remove any transients
            delete_transient('ac_wp_ham_menu_activated');
            
            // Clear any existing caches
            if (function_exists('wp_cache_flush')) {
                wp_cache_flush();
            }
        }
    }
}

// Add activation notice
add_action('admin_notices', function() {
    if (get_transient('ac_wp_ham_menu_activated')) {
        ?>
        <div class="notice notice-success is-dismissible">
            <p>
                <strong>AC WP Hamburger Menu</strong> has been activated! 
                <a href="<?php echo admin_url('options-general.php?page=ac-wp-ham-menu'); ?>">Configure your menu settings</a> 
                to get started.
            </p>
        </div>
        <?php
        delete_transient('ac_wp_ham_menu_activated');
    }
});

// Register activation/deactivation hooks
register_activation_hook(__FILE__, array('AC_WP_Ham_Menu_Installer', 'activate'));
register_deactivation_hook(__FILE__, array('AC_WP_Ham_Menu_Installer', 'deactivate'));
register_uninstall_hook(__FILE__, array('AC_WP_Ham_Menu_Installer', 'uninstall'));