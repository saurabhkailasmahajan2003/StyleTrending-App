# Drawer Navigator - Temporary Fix

## Issue
The app was not building due to a Reanimated 3 compatibility issue with `@react-navigation/drawer`. The drawer navigator was trying to use `useLegacyImplementation` prop which is not supported in Reanimated 3.

## Temporary Solution
The drawer navigator has been temporarily disabled to allow the app to build and run. The navigation now uses `MainStack` directly instead of wrapping it in a `DrawerNavigator`.

## Current Status
- ✅ App should now build and run
- ⚠️ Drawer menu is temporarily disabled
- ✅ Hamburger menu icon navigates to Profile screen as fallback

## Files Modified
1. `src/navigation/AppNavigator.js` - Changed `RootNavigator` to use `MainStack` directly
2. `src/components/HomeHeader.js` - Updated `openDrawer` to navigate to Profile as fallback

## How to Re-enable Drawer

Once the Reanimated 3 compatibility issue is resolved:

1. **Update `src/navigation/AppNavigator.js`:**
   ```javascript
   // Change this line in RootNavigator:
   <Stack.Screen name="Main" component={MainStack} />
   // Back to:
   <Stack.Screen name="Main" component={DrawerNavigator} />
   ```

2. **Update `src/components/HomeHeader.js`:**
   - Restore the original `openDrawer` function that uses `DrawerActions`

## Permanent Fix Options

### Option 1: Wait for Library Update
Wait for `@react-navigation/drawer` to release a version that properly supports Reanimated 3 without trying to use `useLegacyImplementation`.

### Option 2: Use Alternative Drawer
Consider using a different drawer implementation that's compatible with Reanimated 3, such as:
- `react-native-drawer-layout` directly (already installed)
- Custom drawer implementation using Reanimated 3

### Option 3: Downgrade Reanimated (Not Recommended)
Downgrade to Reanimated 2, but this is not recommended as it loses Reanimated 3 features.

## Testing
After re-enabling the drawer:
1. Clear cache: `npx expo start --clear`
2. Test drawer opening/closing
3. Verify all navigation links work
4. Test on both Android and iOS

