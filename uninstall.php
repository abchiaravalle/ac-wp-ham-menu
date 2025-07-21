<?php
/**
 * AC WP Hamburger Menu Uninstall Script
 * This file is called when the plugin is deleted via WordPress admin
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove plugin options
delete_option('ac_wp_ham_menu_settings');

// Remove any transients
delete_transient('ac_wp_ham_menu_activated');

// Clear any cached data
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}

// Optional: Remove any user meta data related to this plugin
// delete_metadata('user', 0, 'ac_wp_ham_menu_user_preference', '', true);