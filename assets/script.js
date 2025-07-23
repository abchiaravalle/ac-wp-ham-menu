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
            this.focusableElements = [];
            
            this.init();
        }

        init() {
            this.setupEventListeners();
            this.setupViewportDetection();
            this.setupKeyboardNavigation();
            this.setupSubmenuHandling();
            this.updateFocusableElements();
            
            // Ensure our GSAP context is isolated from other site GSAP usage
            if (typeof gsap !== 'undefined') {
                this.gsapContext = gsap.context(() => {}, this.container);
                console.log('🎯 GSAP context isolated to plugin container');
            }
            
            console.log('🚀 AC WP Hamburger Menu initialized with scoped styles');
        }

        setupEventListeners() {
            // Toggle button click
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });

            // Set up click outside handler - WordPress compatible
            this.documentClickHandler = (e) => {
                if (!this.isOpen) return;
                
                console.log('🖱️ Document click detected, target:', e.target);
                
                // Close menu if clicking outside the container
                if (!this.container.contains(e.target)) {
                    console.log('🖱️ Click outside container - closing menu');
                    this.closeMenu();
                } else {
                    // Check if click is on a submenu trigger or submenu arrow
                    const clickedLink = e.target.closest('a');
                    const clickedArrow = e.target.closest('.ac-wp-ham-submenu-arrow');
                    const clickedElement = clickedLink || clickedArrow || e.target;
                    
                    // Find the closest menu item to determine if it has children
                    const menuItem = clickedElement.closest('.menu-item');
                    const isSubmenuTrigger = menuItem && menuItem.classList.contains('menu-item-has-children');
                    
                    console.log('🖱️ Clicked element:', clickedElement.textContent?.trim() || clickedElement.tagName);
                    console.log('🖱️ Menu item classes:', menuItem?.className || 'none');
                    console.log('🖱️ Is submenu trigger:', isSubmenuTrigger);
                    
                    // For WordPress menus, we need to check if the link has a real href
                    const hasRealHref = clickedLink && clickedLink.hasAttribute('href') && 
                                       clickedLink.getAttribute('href') !== '#' && 
                                       clickedLink.getAttribute('href') !== '';
                    
                    // Close menu only if:
                    // 1. Not a submenu trigger, OR
                    // 2. Is a submenu trigger but has a real href (should navigate)
                    if (!isSubmenuTrigger || (isSubmenuTrigger && hasRealHref)) {
                        console.log('🖱️ Regular menu item or navigable submenu trigger - closing menu');
                        this.closeMenu();
                    } else {
                        console.log('🖱️ Submenu trigger without href - keeping menu open');
                    }
                }
            };

            // Add the document click handler
            document.addEventListener('click', this.documentClickHandler);

            // Close menu on escape key
            this.escapeKeyHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMenu();
                    this.toggle.focus();
                }
            };
            document.addEventListener('keydown', this.escapeKeyHandler);

            // Handle window resize
            this.resizeHandler = () => {
                if (this.isOpen) {
                    this.updateViewportPosition();
                }
            };
            window.addEventListener('resize', this.resizeHandler);
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
            // Find ALL menu items that have children (WordPress approach)
            const menuItemsWithChildren = this.container.querySelectorAll('.menu-item-has-children');
            console.log('🔧 setupSubmenuHandling - Found menu items with children:', menuItemsWithChildren.length);
            
            // Extract the triggers (links) from these menu items
            const allTriggers = [];
            menuItemsWithChildren.forEach(menuItem => {
                const trigger = menuItem.querySelector(':scope > a');
                if (trigger) {
                    allTriggers.push(trigger);
                }
            });
            console.log('🔧 setupSubmenuHandling - Total triggers extracted:', allTriggers.length);
            
            // ENSURE CLEAN INITIAL STATE - all submenus start hidden
            const allSubmenus = this.container.querySelectorAll('.ac-wp-ham-submenu');
            allSubmenus.forEach(submenu => {
                submenu.classList.remove('ac-wp-ham-submenu-active');
                submenu.parentElement.classList.remove('ac-wp-ham-submenu-open');
            });
            console.log('🧹 Cleaned initial state for', allSubmenus.length, 'submenus');
            
            // Debug WordPress structure
            this.debugWordPressStructure();
            
            // Clear any conflicting GSAP transforms on submenus
            this.clearSubmenuTransforms();
            
            allTriggers.forEach((trigger, index) => {
                const parentItem = trigger.parentElement;
                const submenu = parentItem.querySelector(':scope > .ac-wp-ham-submenu'); // Direct child submenu only
                
                console.log(`🔧 Trigger ${index}:`, trigger.textContent.trim(), 'has direct submenu:', !!submenu);
                console.log(`🔧 Parent item classes:`, parentItem.className);
                
                if (submenu) {
                    const depth = this.getSubmenuDepth(parentItem);
                    console.log(`🔍 Submenu depth: ${depth}, classes: "${submenu.className}"`);
                    
                    // Click to toggle submenu - handle WordPress menu items
                    trigger.addEventListener('click', (e) => {
                        // Check if this link should navigate or toggle submenu
                        const hasRealHref = trigger.hasAttribute('href') && 
                                          trigger.getAttribute('href') !== '#' && 
                                          trigger.getAttribute('href') !== '';
                        
                        if (!hasRealHref) {
                            // No real href - prevent default and toggle submenu
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🖱️ WORDPRESS SUBMENU TOGGLE!', trigger.textContent.trim(), `(depth: ${depth})`);
                            console.log('🖱️ Menu is open:', this.isOpen);
                            console.log('🖱️ Parent item:', parentItem.className);
                            console.log('🖱️ Submenu:', submenu.className);
                            this.toggleSubmenu(parentItem, submenu);
                        } else {
                            console.log('🖱️ WORDPRESS SUBMENU WITH HREF - allowing navigation:', trigger.getAttribute('href'));
                            // Let the link navigate normally, but also show submenu
                            // Don't prevent default for navigation
                        }
                    });
                } else {
                    console.log(`⚠️ No submenu found for trigger:`, trigger.textContent.trim());
                }
            });
        }
        
        getSubmenuDepth(menuItem) {
            let depth = 0;
            let current = menuItem.parentElement; // Start from parent to avoid counting self
            
            while (current && !current.classList.contains('ac-wp-ham-nav-list')) {
                if (current.classList.contains('ac-wp-ham-submenu')) {
                    depth++;
                }
                current = current.parentElement;
            }
            
            console.log('📏 Calculated depth for', menuItem.querySelector('a')?.textContent.trim(), ':', depth);
            return depth;
        }
        
        clearSubmenuTransforms() {
            // Clear any GSAP transforms that might interfere with submenu positioning
            // ONLY target elements within our plugin container to avoid affecting other GSAP timelines
            const allSubmenus = this.container.querySelectorAll('.ac-wp-ham-submenu');
            allSubmenus.forEach(submenu => {
                // Only clear transforms if they appear to be GSAP-set (have data attributes or specific patterns)
                if (submenu.hasAttribute('style') && submenu.style.transform) {
                    // Check if this looks like a GSAP transform before clearing
                    const currentTransform = submenu.style.transform;
                    if (currentTransform.includes('translate') || currentTransform.includes('scale') || currentTransform.includes('rotate')) {
                        submenu.style.transform = '';
                        console.log('🧹 Cleared transform from submenu:', currentTransform);
                    }
                }
                
                // Clear GSAP-specific properties only if they exist
                if (submenu.style.translate) submenu.style.translate = '';
                if (submenu.style.rotate) submenu.style.rotate = '';
                if (submenu.style.scale) submenu.style.scale = '';
                
                // Only clear opacity if it's not our intended 0 (hidden state)
                if (submenu.style.opacity && submenu.style.opacity !== '0' && submenu.style.opacity !== '') {
                    submenu.style.opacity = '';
                    console.log('🧹 Cleared opacity from submenu');
                }
            });
            console.log('🧹 Safely cleared GSAP conflicts from', allSubmenus.length, 'submenus');
        }
        
        debugWordPressStructure() {
            console.log('🔍 WordPress Menu Structure Debug:');
            const allMenuItems = this.container.querySelectorAll('.menu-item');
            allMenuItems.forEach((item, index) => {
                const link = item.querySelector('a');
                const submenu = item.querySelector(':scope > .ac-wp-ham-submenu');
                const hasChildrenClass = item.classList.contains('menu-item-has-children');
                const depth = this.getSubmenuDepth(item);
                
                console.log(`📋 Item ${index}:`, {
                    text: link?.textContent.trim(),
                    classes: item.className,
                    hasChildrenClass,
                    hasSubmenu: !!submenu,
                    submenuClasses: submenu?.className,
                    depth
                });
            });
        }

        toggleSubmenu(parentItem, submenu) {
            console.log('🔄 toggleSubmenu called!');
            console.log('🔄 Submenu has active class:', submenu.classList.contains('ac-wp-ham-submenu-active'));
            
            if (submenu.classList.contains('ac-wp-ham-submenu-active')) {
                console.log('⬇️ Hiding submenu');
                this.hideSubmenu(parentItem, submenu);
            } else {
                console.log('⬆️ Showing submenu (will close others first)');
                this.showSubmenu(parentItem, submenu);
            }
        }

        showSubmenu(parentItem, submenu) {
            // CLOSE OTHER OPEN SUBMENUS FIRST (except this one)
            this.closeOtherSubmenus(submenu);
            
            // Check if submenu would overflow viewport and position accordingly
            this.positionSubmenu(parentItem, submenu);
            
            // Show submenu - SIMPLE APPROACH
            parentItem.classList.add('ac-wp-ham-submenu-open');
            submenu.classList.add('ac-wp-ham-submenu-active');
            
            const isMobile = window.innerWidth <= 768;
            console.log(`🎯 SIMPLE SHOW (${isMobile ? 'mobile inline' : 'desktop overlay'}) - Submenu display:`, getComputedStyle(submenu).display);
            
            // Animate submenu items after a tiny delay to ensure display is applied
            setTimeout(() => {
                const submenuItems = submenu.querySelectorAll('li');
                // Use scoped GSAP context to avoid conflicts with other site animations
                if (this.gsapContext && typeof gsap !== 'undefined') {
                    this.gsapContext.add(() => {
                        gsap.fromTo(submenuItems, {
                            opacity: 0,
                            x: 20
                        }, {
                            duration: 0.3,
                            opacity: 1,
                            x: 0,
                            stagger: 0.05,
                            ease: "power2.out"
                        });
                    });
                }
            }, 10);
        }

        hideSubmenu(parentItem, submenu) {
            // Hide submenu - SIMPLE APPROACH
            parentItem.classList.remove('ac-wp-ham-submenu-open');
            submenu.classList.remove('ac-wp-ham-submenu-active');
            
            console.log('🎯 SIMPLE HIDE - Submenu display:', getComputedStyle(submenu).display);
            
            // Also hide any nested submenus
            const nestedSubmenus = submenu.querySelectorAll('.ac-wp-ham-submenu');
            nestedSubmenus.forEach(nested => {
                nested.classList.remove('ac-wp-ham-submenu-active');
                nested.parentElement.classList.remove('ac-wp-ham-submenu-open');
            });
        }

        positionSubmenu(parentItem, submenu) {
            // Skip positioning on mobile - submenus are inline
            if (window.innerWidth <= 768) {
                return;
            }
            
            // Reset positioning classes
            submenu.classList.remove('ac-wp-ham-submenu-left');
            
            // Get viewport dimensions and submenu depth
            const viewportWidth = window.innerWidth;
            const depth = this.getSubmenuDepth(parentItem);
            const submenuWidth = 220; // Approximate submenu width
            
            // For nested submenus, check positioning relative to the parent submenu
            let referenceElement = this.menu;
            if (depth > 0) {
                // Find the parent submenu for positioning reference
                referenceElement = parentItem.closest('.ac-wp-ham-submenu') || this.menu;
            }
            
            const referenceRect = referenceElement.getBoundingClientRect();
            
            // Check if submenu would overflow right edge
            // For nested submenus, we need to account for multiple levels of offset
            const totalOffsetWidth = submenuWidth * (depth + 1);
            
            if (referenceRect.right + totalOffsetWidth > viewportWidth - 20) {
                submenu.classList.add('ac-wp-ham-submenu-left');
                console.log(`📍 Positioning submenu to LEFT (depth: ${depth}, would overflow)`);
            } else {
                console.log(`📍 Positioning submenu to RIGHT (depth: ${depth}, fits)`);
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

        closeAllSubmenus() {
            // Close all open submenus
            const openSubmenus = this.container.querySelectorAll('.ac-wp-ham-submenu-active');
            openSubmenus.forEach(submenu => {
                const parentItem = submenu.closest('.menu-item-has-children');
                this.hideSubmenu(parentItem, submenu);
            });
        }

        closeOtherSubmenus(exceptSubmenu) {
            // Close sibling and unrelated submenus, but keep parent submenus open
            const openSubmenus = this.container.querySelectorAll('.ac-wp-ham-submenu-active');
            const isMobile = window.innerWidth <= 768;
            
            openSubmenus.forEach(submenu => {
                if (submenu !== exceptSubmenu) {
                    // Check if this submenu is a parent of the exceptSubmenu
                    const isParentOfException = exceptSubmenu && submenu.contains(exceptSubmenu);
                    
                    if (!isParentOfException) {
                        const parentItem = submenu.closest('.menu-item-has-children');
                        if (parentItem) {
                            console.log(`🔄 Closing other submenu (${isMobile ? 'mobile' : 'desktop'}):`, parentItem.querySelector('a').textContent.trim());
                            this.hideSubmenu(parentItem, submenu);
                        }
                    } else {
                        console.log(`🔄 Keeping parent submenu open:`, submenu.closest('.menu-item-has-children').querySelector('a').textContent.trim());
                    }
                }
            });
        }

        updateFocusableElements() {
            // Get all focusable elements in the menu (including submenus)
            this.focusableElements = Array.from(this.menu.querySelectorAll('a'));
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

            // Animate menu container with scoped GSAP context
            if (this.gsapContext && typeof gsap !== 'undefined') {
                this.gsapContext.add(() => {
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
                });
            }

            // Animate menu items with stagger
            this.animateMenuItems('in');
        }

        closeMenu() {
            this.isOpen = false;
            
            // Update ARIA attributes
            this.toggle.setAttribute('aria-expanded', 'false');
            this.menu.setAttribute('aria-hidden', 'true');

            // Close all open submenus
            this.closeAllSubmenus();

            // Animate menu items out
            this.animateMenuItems('out', () => {
                // Animate menu container out with scoped GSAP context
                if (this.gsapContext && typeof gsap !== 'undefined') {
                    this.gsapContext.add(() => {
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
            });
        }

        animateMenuItems(direction, callback) {
            const items = Array.from(this.menuItems);
            
            // Use scoped GSAP context for all menu item animations
            if (this.gsapContext && typeof gsap !== 'undefined') {
                this.gsapContext.add(() => {
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
                });
            } else if (callback) {
                // Fallback if GSAP is not available
                callback();
            }
        }

        // Public method to close menu (useful for external scripts)
        close() {
            if (this.isOpen) {
                this.closeMenu();
            }
        }

        // Cleanup method to remove event listeners
        destroy() {
            if (this.documentClickHandler) {
                document.removeEventListener('click', this.documentClickHandler);
            }
            if (this.escapeKeyHandler) {
                document.removeEventListener('keydown', this.escapeKeyHandler);
            }
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
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
        HamburgerMenu: HamburgerMenu, // Expose class for debugging
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