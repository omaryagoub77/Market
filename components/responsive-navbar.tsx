import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Platform,
  Modal,
  ScrollView
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Define the navigation items
const NAV_ITEMS = [
  {
    id: 'home',
    name: 'Home',
    icon: 'house.fill',
    route: '/home-feed',
  },
  {
    id: 'post',
    name: 'Post',
    icon: 'plus.circle.fill',
    route: '/post-item',
  },
  {
    id: 'messages',
    name: 'Messages',
    icon: 'message.fill',
    route: '/chat-list',
  },
  {
    id: 'products',
    name: 'My Products',
    icon: 'basket.fill',
    route: '/my-products',
  },
  {
    id: 'favorites',
    name: 'Favorites',
    icon: 'heart.fill',
    route: '/favourite',
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: 'person.fill',
    route: '/profile',
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: 'gear.fill',
    route: '/admin',
  },
  {
    id: 'reviews',
    name: 'Reviews',
    icon: 'star.fill',
    route: '/reviews',
  },
];

// More items for the overflow menu
const MORE_ITEMS = NAV_ITEMS.slice(4); // Items beyond the first 4

interface NavItemProps {
  id: string;
  name: string;
  icon: string;
  route: string;
  isActive: boolean;
  isCompact?: boolean;
  onPress: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  id, 
  name, 
  icon, 
  route, 
  isActive, 
  isCompact = false,
  onPress 
}) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? Colors.BG_ALT : Colors.BG_LIGHT;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.navItem,
        isCompact && styles.compactNavItem,
        isActive && styles.activeNavItem,
      ]}
      accessibilityLabel={`${name} tab`}
      accessibilityState={{ selected: isActive }}
    >
      <View style={[
        styles.iconContainer,
        isActive && styles.activeIconContainer,
      ]}>
        <IconSymbol 
          name={icon as any} 
          size={24} 
          color={isActive ? Colors.PRIMARY_START : Colors.ICON} 
        />
      </View>
      {!isCompact && (
        <Text style={[
          styles.navText,
          { color: isActive ? Colors.PRIMARY_START : Colors.TEXT },
        ]}>
          {name}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const MoreMenu: React.FC<{
  visible: boolean;
  onClose: () => void;
  onItemSelected: (route: string) => void;
}> = ({ visible, onClose, onItemSelected }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleItemPress = (route: string) => {
    onItemSelected(route);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.moreMenu}>
          <ScrollView>
            {MORE_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.moreMenuItem}
                onPress={() => handleItemPress(item.route)}
              >
                <IconSymbol 
                  name={item.icon as any} 
                  size={20} 
                  color={pathname === item.route ? Colors.PRIMARY_START : Colors.TEXT} 
                />
                <Text style={[
                  styles.moreMenuText,
                  { color: pathname === item.route ? Colors.PRIMARY_START : Colors.TEXT },
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const ResponsiveNavbar: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Update width on dimension changes
  useEffect(() => {
    const onChange = ({ window }: { window: { width: number } }) => {
      setWindowWidth(window.width);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  // Determine how many items to show based on screen width
  // Small screens: show 4 items + More
  // Large screens: show all items
  const getMaxVisibleItems = () => {
    if (windowWidth < 350) return 3; // Very small screens
    if (windowWidth < 400) return 4; // Small screens
    return NAV_ITEMS.length; // Large screens
  };
  
  const maxVisibleItems = getMaxVisibleItems();
  const shouldShowMore = NAV_ITEMS.length > maxVisibleItems;
  const visibleItems = NAV_ITEMS.slice(0, shouldShowMore ? maxVisibleItems - 1 : maxVisibleItems);
  const isCompact = windowWidth < 375; // Compact mode for very small screens
  
  const handleNavPress = (route: string) => {
    router.push(route as any);
  };
  
  const handleMorePress = () => {
    if (windowWidth >= 400) {
      // On larger screens, navigate to the more screen
      router.push('/more');
    } else {
      // On smaller screens, show the modal menu
      setMoreMenuVisible(true);
    }
  };
  
  return (
    <>
      <View style={styles.container}>
        <View style={styles.navbar}>
          {visibleItems.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              name={item.name}
              icon={item.icon}
              route={item.route}
              isActive={pathname === item.route}
              isCompact={isCompact}
              onPress={() => handleNavPress(item.route)}
            />
          ))}
          
          {shouldShowMore && (
            <NavItem
              id="more"
              name="More"
              icon="ellipsis.circle.fill"
              route="/more"
              isActive={pathname === '/more'}
              isCompact={isCompact}
              onPress={handleMorePress}
            />
          )}
        </View>
      </View>
      
      <MoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        onItemSelected={handleNavPress}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.BG_LIGHT,
    height: 74,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: Spacing.LIST_GAP,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minWidth: 40, // Minimum touch target size
  },
  compactNavItem: {
    paddingHorizontal: 4,
  },
  activeNavItem: {
    // No additional styling needed for active item
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radii.CIRCLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(175, 255, 75, 0.2)', // Primary color with opacity
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  moreMenu: {
    backgroundColor: Colors.BG_LIGHT,
    maxHeight: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: Spacing.LIST_GAP,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.COMPONENT,
    paddingHorizontal: Spacing.SCREEN_PADDING,
  },
  moreMenuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: Spacing.COMPONENT,
  },
});

export default ResponsiveNavbar;