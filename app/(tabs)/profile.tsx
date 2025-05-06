import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from 'react-hook-form';
import {
  LogOut,
  Camera,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  Globe,
  ChevronRight,
} from 'lucide-react-native';
import { RootState } from '@/store';
import { updateProfile, logout } from '@/store/slices/authSlice';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';

type ProfileFormData = {
  fullName: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  whatsappNumber: string;
  socialHandles: {
    instagram: string;
    twitter: string;
    facebook: string;
  };
  website: string;
};

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profileImage || null
  );
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.user_metadata.full_name || '',
      gender: user?.gender || 'male',
      birthDate: user?.birthDate || '',
      whatsappNumber: user?.whatsappNumber || '',
      socialHandles: {
        instagram: user?.socialHandles?.instagram || '',
        twitter: user?.socialHandles?.twitter || '',
        facebook: user?.socialHandles?.facebook || '',
      },
      website: user?.website || '',
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.user_metadata.full_name,
        gender: user.gender || 'male',
        birthDate: user.birthDate || '',
        whatsappNumber: user.whatsappNumber || '',
        socialHandles: {
          instagram: user.socialHandles?.instagram || '',
          twitter: user.socialHandles?.twitter || '',
          facebook: user.socialHandles?.facebook || '',
        },
        website: user.website || '',
      });
    }
  }, [user, reset]);

  // Pick profile image
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photos to change profile picture.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // In a real app, you would upload the image to a server and update the profile
      // dispatch(updateProfile({ profileImage: result.assets[0].uri }) as any);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode && isDirty) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to discard them?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setEditMode(false);
              reset();
            },
          },
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
        ]
      );
    } else {
      setEditMode(!editMode);
    }
  };

  // Toggle selected section
  const toggleSection = (section: string) => {
    if (selectedSection === section) {
      setSelectedSection(null);
    } else {
      setSelectedSection(section);
    }
  };

  // Handle save profile
  const onSubmit = (data: ProfileFormData) => {
    dispatch(updateProfile({ ...data, profileImage }) as any);
    setEditMode(false);
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout() as any),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={toggleEditMode}
          >
            <Text style={styles.editButtonText}>
              {editMode ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color={Colors.neutral[700]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={pickImage}
            disabled={!editMode}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {user?.user_metadata.full_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {editMode && (
              <View style={styles.cameraIcon}>
                <Camera size={16} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.profileName}>{user?.user_metadata.full_name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          
          {editMode ? (
            <Button
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              style={styles.saveButton}
              size="small"
            />
          ) : null}
        </View>

        {/* Personal Information */}
        <Card variant="outlined" style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('personal')}
          >
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <ChevronRight
              size={20}
              color={Colors.neutral[600]}
              style={{
                transform: [
                  {
                    rotate:
                      selectedSection === 'personal' ? '90deg' : '0deg',
                  },
                ],
              }}
            />
          </TouchableOpacity>
          
          {selectedSection === 'personal' && (
            <View style={styles.sectionContent}>
              <Controller
                control={control}
                name="fullName"
                rules={{
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name cannot exceed 50 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                    editable={editMode}
                  />
                )}
              />
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Gender</Text>
                <View style={styles.genderOptions}>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.genderOption,
                            value === 'male' && styles.genderOptionSelected,
                          ]}
                          onPress={() => editMode && onChange('male')}
                          disabled={!editMode}
                        >
                          <Text
                            style={[
                              styles.genderOptionText,
                              value === 'male' && styles.genderOptionTextSelected,
                            ]}
                          >
                            Male
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.genderOption,
                            value === 'female' && styles.genderOptionSelected,
                          ]}
                          onPress={() => editMode && onChange('female')}
                          disabled={!editMode}
                        >
                          <Text
                            style={[
                              styles.genderOptionText,
                              value === 'female' && styles.genderOptionTextSelected,
                            ]}
                          >
                            Female
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.genderOption,
                            value === 'other' && styles.genderOptionSelected,
                          ]}
                          onPress={() => editMode && onChange('other')}
                          disabled={!editMode}
                        >
                          <Text
                            style={[
                              styles.genderOptionText,
                              value === 'other' && styles.genderOptionTextSelected,
                            ]}
                          >
                            Other
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  />
                </View>
              </View>
              
              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Birth Date"
                    placeholder="YYYY-MM-DD"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.birthDate?.message}
                    editable={editMode}
                  />
                )}
              />
            </View>
          )}
        </Card>

        {/* Contact Information */}
        <Card variant="outlined" style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('contact')}
          >
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <ChevronRight
              size={20}
              color={Colors.neutral[600]}
              style={{
                transform: [
                  {
                    rotate:
                      selectedSection === 'contact' ? '90deg' : '0deg',
                  },
                ],
              }}
            />
          </TouchableOpacity>
          
          {selectedSection === 'contact' && (
            <View style={styles.sectionContent}>
              <Input
                label="Email"
                value={user?.email}
                leftIcon={<Mail size={20} color={Colors.neutral[500]} />}
                editable={false}
              />
              
              <Controller
                control={control}
                name="whatsappNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="WhatsApp Number"
                    placeholder="+62 8xx xxxx xxxx"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={<Phone size={20} color={Colors.neutral[500]} />}
                    error={errors.whatsappNumber?.message}
                    editable={editMode}
                    keyboardType="phone-pad"
                  />
                )}
              />
              
              <Controller
                control={control}
                name="website"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Website"
                    placeholder="https://yourwebsite.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={<Globe size={20} color={Colors.neutral[500]} />}
                    error={errors.website?.message}
                    editable={editMode}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
          )}
        </Card>

        {/* Social Media */}
        <Card variant="outlined" style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('social')}
          >
            <Text style={styles.sectionTitle}>Social Media</Text>
            <ChevronRight
              size={20}
              color={Colors.neutral[600]}
              style={{
                transform: [
                  {
                    rotate:
                      selectedSection === 'social' ? '90deg' : '0deg',
                  },
                ],
              }}
            />
          </TouchableOpacity>
          
          {selectedSection === 'social' && (
            <View style={styles.sectionContent}>
              <Controller
                control={control}
                name="socialHandles.instagram"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Instagram"
                    placeholder="@username"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={<Instagram size={20} color={Colors.neutral[500]} />}
                    editable={editMode}
                    autoCapitalize="none"
                  />
                )}
              />
              
              <Controller
                control={control}
                name="socialHandles.twitter"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Twitter"
                    placeholder="@username"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={<Twitter size={20} color={Colors.neutral[500]} />}
                    editable={editMode}
                    autoCapitalize="none"
                  />
                )}
              />
              
              <Controller
                control={control}
                name="socialHandles.facebook"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Facebook"
                    placeholder="username or profile URL"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={<Facebook size={20} color={Colors.neutral[500]} />}
                    editable={editMode}
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
          )}
        </Card>

        {/* App Settings */}
        <Card variant="outlined" style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('settings')}
          >
            <Text style={styles.sectionTitle}>App Settings</Text>
            <ChevronRight
              size={20}
              color={Colors.neutral[600]}
              style={{
                transform: [
                  {
                    rotate:
                      selectedSection === 'settings' ? '90deg' : '0deg',
                  },
                ],
              }}
            />
          </TouchableOpacity>
          
          {selectedSection === 'settings' && (
            <View style={styles.sectionContent}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Switch
                  value={isDarkModeEnabled}
                  onValueChange={setIsDarkModeEnabled}
                  trackColor={{ false: Colors.neutral[300], true: Colors.primary[300] }}
                  thumbColor={isDarkModeEnabled ? Colors.primary[500] : Colors.neutral[100]}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Switch
                  value={isNotificationsEnabled}
                  onValueChange={setIsNotificationsEnabled}
                  trackColor={{ false: Colors.neutral[300], true: Colors.primary[300] }}
                  thumbColor={isNotificationsEnabled ? Colors.primary[500] : Colors.neutral[100]}
                />
              </View>
              
              <TouchableOpacity style={styles.settingAction}>
                <Text style={styles.settingActionText}>Privacy Policy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingAction}>
                <Text style={styles.settingActionText}>Terms of Service</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingAction}>
                <Text style={styles.settingActionText}>Help & Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.settingAction, styles.dangerAction]}
                onPress={handleLogout}
              >
                <Text style={styles.dangerActionText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerTitle: {
    ...Typography.headingMedium,
    color: Colors.neutral[900],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
  },
  editButtonText: {
    ...Typography.labelMedium,
    color: Colors.primary[600],
  },
  logoutButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    ...Typography.displaySmall,
    color: Colors.primary[700],
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary[500],
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileName: {
    ...Typography.headingMedium,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
  },
  saveButton: {
    minWidth: 120,
  },
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
  },
  sectionContent: {
    paddingTop: Spacing.md,
  },
  formRow: {
    marginBottom: Spacing.md,
  },
  formLabel: {
    ...Typography.labelMedium,
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
  },
  genderOptionSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  genderOptionText: {
    ...Typography.labelMedium,
    color: Colors.neutral[700],
  },
  genderOptionTextSelected: {
    color: Colors.primary[700],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  settingLabel: {
    ...Typography.bodyMedium,
    color: Colors.neutral[800],
  },
  settingAction: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  settingActionText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[800],
  },
  dangerAction: {
    borderBottomWidth: 0,
  },
  dangerActionText: {
    ...Typography.labelMedium,
    color: Colors.error[600],
  },
});
