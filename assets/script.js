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

            // Close menu when clicking outside - use a more targeted approach
            document.addEventListener('click', (e) => {
                if (!this.isOpen) return;
                
                // Don't close if clicking inside the container
                if (this.container.contains(e.target)) {
                    // Check if clicking on a submenu trigger or its children
                    const clickedElement = e.target;
                    const isSubmenuTrigger = clickedElement.closest('.menu-item-has-children > a');
                    const isSubmenuArrow = clickedElement.classList.contains('ac-wp-ham-submenu-arrow');
                    
                    // Don't close menu if clicking on submenu triggers or arrows
                    if (isSubmenuTrigger || isSubmenuArrow) {
                        return;
                    }
                    
                    // Close menu if clicking on regular menu items (not submenu triggers)
                    const isRegularMenuItem = clickedElement.closest('.menu-item:not(.menu-item-has-children) > a');
                    const isBackButton = clickedElement.closest('.ac-wp-ham-back-button');
                    
                    if (isRegularMenuItem && !isBackButton) {
                        this.closeMenu();
                    }
                } else {
                    // Clicking outside the container - close menu
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
                    e.stopPropagation();
                    this.handleSubmenuClick(trigger);
                });
            });
        }

        handleSubmenuClick(trigger) {
            const submenu = trigger.parentElement.querySelector('.ac-wp-ham-submenu');
            if (submenu) {
                // If this submenu is already open, close it
                if (this.currentSubmenu === submenu && submenu.classList.contains('ac-wp-ham-submenu-active')) {
                    this.closeSubmenu(submenu);
                    return;
                }
                
                // Close any other open submenu first
                if (this.currentSubmenu && this.currentSubmenu !== submenu) {
                    this.closeSubmenu(this.currentSubmenu);
                }
                
                // Open the new submenu
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
            
            // Mark the current parent
            const parentMenuItem = submenu.closest('.menu-item-has-children');
            parentMenuItem.classList.add('ac-wp-ham-current-parent');
            
            // Add back button to submenu if it doesn't exist
            if (!submenu.querySelector('.ac-wp-ham-back-button')) {
                const backButton = document.createElement('li');
                backButton.className = 'menu-item ac-wp-ham-back-item';
                backButton.innerHTML = '<a href="#" class="ac-wp-ham-back-button"><span class="ac-wp-ham-back-arrow">‹</span> Back</a>';
                submenu.insertBefore(backButton, submenu.firstChild);
                
                // Add back button event listener
                const backLink = backButton.querySelector('.ac-wp-ham-back-button');
                backLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeSubmenu(submenu);
                });
            }
            
            // Switch to submenu mode
            this.menu.classList.add('ac-wp-ham-submenu-mode');
            
            // Animate main menu out
            const mainNavList = this.menu.querySelector('.ac-wp-ham-nav-list');
            gsap.to(mainNavList, {
                duration: 0.2,
                opacity: 0,
                x: -30,
                ease: "power2.in",
                onComplete: () => {
                    // Show submenu
                    submenu.classList.add('ac-wp-ham-submenu-active');
                    
                    // Set initial state for submenu items
                    const submenuItems = submenu.querySelectorAll('li');
                    gsap.set(submenuItems, {
                        opacity: 0,
                        x: 30
                    });
                    
                    // Animate submenu in
                    gsap.to(submenuItems, {
                        duration: 0.3,
                        opacity: 1,
                        x: 0,
                        ease: "power2.out",
                        stagger: 0.05
                    });
                }
            });

            this.updateFocusableElements();
        }

        closeSubmenu(submenu) {
            // Animate submenu items out
            const submenuItems = submenu.querySelectorAll('li');
            gsap.to(submenuItems, {
                duration: 0.2,
                opacity: 0,
                x: 30,
                ease: "power2.in",
                stagger: 0.02,
                onComplete: () => {
                    // Hide submenu and exit submenu mode
                    submenu.classList.remove('ac-wp-ham-submenu-active');
                    this.menu.classList.remove('ac-wp-ham-submenu-mode');
                    
                    // Animate main menu back in
                    const mainNavList = this.menu.querySelector('.ac-wp-ham-nav-list');
                    gsap.set(this.menuItems, {
                        opacity: 0,
                        x: -30
                    });
                    
                    gsap.to(this.menuItems, {
                        duration: 0.3,
                        opacity: 1,
                        x: 0,
                        ease: "power2.out",
                        stagger: 0.05
                    });
                }
            });

            // Remove current parent marker
            const parentMenuItem = submenu.closest('.menu-item-has-children');
            parentMenuItem.classList.remove('ac-wp-ham-current-parent');

            if (this.currentSubmenu === submenu) {
                this.currentSubmenu = null;
            }
            
            this.updateFocusableElements();
        }

        updateFocusableElements() {
            // Get all focusable elements in the currently visible menu
            let selector = '.ac-wp-ham-nav-list > li > a';
            if (this.currentSubmenu && this.currentSubmenu.classList.contains('ac-wp-ham-submenu-active')) {
                selector = '.ac-wp-ham-submenu-active a';
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
                // Set initial states - all items come from the left
                gsap.set(items, {
                    opacity: 0,
                    x: -30,
                    rotationY: -15
                });

                // Animate in with faster stagger
                gsap.to(items, {
                    duration: 0.4,
                    opacity: 1,
                    x: 0,
                    rotationY: 0,
                    ease: "power2.out",
                    stagger: {
                        amount: 0.1,
                        from: "start"
                    }
                });
            } else {
                // Animate out with faster stagger - all items go to the left
                gsap.to(items, {
                    duration: 0.25,
                    opacity: 0,
                    x: -20,
                    rotationY: -10,
                    ease: "power2.in",
                    stagger: {
                        amount: 0.05,
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