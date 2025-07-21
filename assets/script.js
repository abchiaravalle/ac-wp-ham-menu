/**
 * AC WP Hamburger Menu JavaScript
 * Uses GSAP for iOS-style animations and interactions
 */

(function() {
    'use strict';

    // Wait for GSAP to be loaded
    function initWhenReady() {
        if (typeof gsap === 'undefined') {
            setTimeout(initWhenReady, 50);
            return;
        }
        initHamburgerMenus();
    }

    function initHamburgerMenus() {
        const containers = document.querySelectorAll('.ac-wp-ham-container');
        
        containers.forEach(container => {
            // Skip if already initialized
            if (container._hamMenuInstance) {
                return;
            }
            
            container._hamMenuInstance = new HamburgerMenu(container);
        });
    }

    class HamburgerMenu {
        constructor(container) {
            this.container = container;
            this.toggle = container.querySelector('.ac-wp-ham-toggle');
            this.menu = container.querySelector('.ac-wp-ham-menu');
            this.menuItems = container.querySelectorAll('.ac-wp-ham-nav-list > li');
            this.isOpen = false;
            this.currentSubmenu = null;
            this.focusableElements = [];
            
            this.init();
        }

        init() {
            this.setupEventListeners();
            this.setupViewportDetection();
            this.setupKeyboardNavigation();
            this.setupSubmenuHandling();
            this.updateFocusableElements();
        }

        setupEventListeners() {
            // Toggle button click
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.container.contains(e.target)) {
                    this.closeMenu();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMenu();
                    this.toggle.focus();
                }
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.isOpen) {
                    this.updateViewportPosition();
                }
            });
        }

        setupViewportDetection() {
            this.updateViewportPosition();
        }

        updateViewportPosition() {
            const rect = this.container.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const menuWidth = 280; // Approximate menu width
            const menuHeight = 300; // Approximate menu height

            // Remove existing classes
            this.container.classList.remove('ac-wp-ham-near-right-edge', 'ac-wp-ham-near-bottom-edge');

            // Check if menu would overflow right edge
            if (rect.left + menuWidth > viewportWidth - 20) {
                this.container.classList.add('ac-wp-ham-near-right-edge');
            }

            // Check if menu would overflow bottom edge
            if (rect.bottom + menuHeight > viewportHeight - 20) {
                this.container.classList.add('ac-wp-ham-near-bottom-edge');
            }
        }

        setupKeyboardNavigation() {
            this.menu.addEventListener('keydown', (e) => {
                this.handleKeyNavigation(e);
            });
        }

        handleKeyNavigation(e) {
            const focusedElement = document.activeElement;
            const currentIndex = this.focusableElements.indexOf(focusedElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusNextElement(currentIndex);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusPreviousElement(currentIndex);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.handleSubmenuNavigation(focusedElement, 'open');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.handleSubmenuNavigation(focusedElement, 'close');
                    break;
                case 'Home':
                    e.preventDefault();
                    this.focusableElements[0]?.focus();
                    break;
                case 'End':
                    e.preventDefault();
                    this.focusableElements[this.focusableElements.length - 1]?.focus();
                    break;
            }
        }

        focusNextElement(currentIndex) {
            const nextIndex = currentIndex < this.focusableElements.length - 1 ? currentIndex + 1 : 0;
            this.focusableElements[nextIndex]?.focus();
        }

        focusPreviousElement(currentIndex) {
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.focusableElements.length - 1;
            this.focusableElements[prevIndex]?.focus();
        }

        setupSubmenuHandling() {
            const submenuTriggers = this.container.querySelectorAll('.menu-item-has-children > a');
            
            submenuTriggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleSubmenuClick(trigger);
                });
            });
        }

        handleSubmenuClick(trigger) {
            const submenu = trigger.parentElement.querySelector('.ac-wp-ham-submenu');
            if (submenu) {
                if (this.currentSubmenu && this.currentSubmenu !== submenu) {
                    this.closeSubmenu(this.currentSubmenu);
                }
                this.openSubmenu(submenu);
            }
        }

        handleSubmenuNavigation(focusedElement, action) {
            const listItem = focusedElement.closest('li');
            
            if (action === 'open' && listItem.classList.contains('menu-item-has-children')) {
                const submenu = listItem.querySelector('.ac-wp-ham-submenu');
                if (submenu) {
                    this.openSubmenu(submenu);
                    const firstLink = submenu.querySelector('a');
                    if (firstLink) firstLink.focus();
                }
            } else if (action === 'close' && this.currentSubmenu) {
                const parentTrigger = this.currentSubmenu.parentElement.querySelector('a');
                this.closeSubmenu(this.currentSubmenu);
                if (parentTrigger) parentTrigger.focus();
            }
        }

        openSubmenu(submenu) {
            this.currentSubmenu = submenu;
            
            // Animate submenu entrance
            gsap.set(submenu, { 
                display: 'block',
                opacity: 0,
                x: -20,
                rotationY: -10
            });
            
            gsap.to(submenu, {
                duration: 0.3,
                opacity: 1,
                x: 0,
                rotationY: 0,
                ease: "power2.out"
            });

            submenu.classList.add('ac-wp-ham-submenu-active');
            this.updateFocusableElements();
        }

        closeSubmenu(submenu) {
            gsap.to(submenu, {
                duration: 0.2,
                opacity: 0,
                x: -20,
                rotationY: -10,
                ease: "power2.in",
                onComplete: () => {
                    submenu.style.display = 'none';
                    submenu.classList.remove('ac-wp-ham-submenu-active');
                }
            });

            if (this.currentSubmenu === submenu) {
                this.currentSubmenu = null;
            }
            
            this.updateFocusableElements();
        }

        updateFocusableElements() {
            // Get all focusable elements in the currently visible menu
            let selector = '.ac-wp-ham-nav-list > li > a';
            if (this.currentSubmenu) {
                const submenuId = this.currentSubmenu.classList.contains('ac-wp-ham-submenu-active');
                if (submenuId) {
                    selector = '.ac-wp-ham-submenu-active a';
                }
            }
            
            this.focusableElements = Array.from(this.menu.querySelectorAll(selector));
        }

        toggleMenu() {
            if (this.isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        }

        openMenu() {
            this.isOpen = true;
            this.updateViewportPosition();
            
            // Update ARIA attributes
            this.toggle.setAttribute('aria-expanded', 'true');
            this.menu.setAttribute('aria-hidden', 'false');
            
            // Add open class for CSS transitions
            this.menu.classList.add('ac-wp-ham-menu-open');

            // Animate menu container
            gsap.fromTo(this.menu, {
                opacity: 0,
                scale: 0.95,
                y: -10,
                rotationX: -10
            }, {
                duration: 0.4,
                opacity: 1,
                scale: 1,
                y: 0,
                rotationX: 0,
                ease: "power2.out"
            });

            // Animate menu items with stagger
            this.animateMenuItems('in');
        }

        closeMenu() {
            this.isOpen = false;
            
            // Update ARIA attributes
            this.toggle.setAttribute('aria-expanded', 'false');
            this.menu.setAttribute('aria-hidden', 'true');

            // Close any open submenus
            if (this.currentSubmenu) {
                this.closeSubmenu(this.currentSubmenu);
            }

            // Animate menu items out
            this.animateMenuItems('out', () => {
                // Animate menu container out
                gsap.to(this.menu, {
                    duration: 0.3,
                    opacity: 0,
                    scale: 0.95,
                    y: -10,
                    rotationX: -10,
                    ease: "power2.in",
                    onComplete: () => {
                        this.menu.classList.remove('ac-wp-ham-menu-open');
                    }
                });
            });
        }

        animateMenuItems(direction, callback) {
            const items = Array.from(this.menuItems);
            
            if (direction === 'in') {
                // Set initial states
                gsap.set(items, {
                    opacity: 0,
                    x: (index) => index % 2 === 0 ? -30 : 30,
                    rotationY: (index) => index % 2 === 0 ? -15 : 15
                });

                // Animate in with stagger
                gsap.to(items, {
                    duration: 0.4,
                    opacity: 1,
                    x: 0,
                    rotationY: 0,
                    ease: "power2.out",
                    stagger: {
                        amount: 0.2,
                        from: "start"
                    }
                });
            } else {
                // Animate out with stagger
                gsap.to(items, {
                    duration: 0.25,
                    opacity: 0,
                    x: (index) => index % 2 === 0 ? -20 : 20,
                    rotationY: (index) => index % 2 === 0 ? -10 : 10,
                    ease: "power2.in",
                    stagger: {
                        amount: 0.1,
                        from: "end"
                    },
                    onComplete: callback
                });
            }
        }

        // Public method to close menu (useful for external scripts)
        close() {
            if (this.isOpen) {
                this.closeMenu();
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }

    // Expose close method globally for external use
    window.ACWPHamMenu = {
        closeAll: function() {
            document.querySelectorAll('.ac-wp-ham-container').forEach(container => {
                const instance = container._hamMenuInstance;
                if (instance) {
                    instance.close();
                }
            });
        }
    };

})();