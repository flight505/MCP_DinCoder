# Project Constitution: Mobile Application

## Project Principles

### 1. Mobile-First Design
- Design for touch interactions
- Optimize for battery life and data usage
- Support offline-first functionality
- Follow platform guidelines (iOS/Android)

### 2. Performance
- App launch time < 2s
- 60 FPS animations
- Bundle size < 50MB
- Minimize API calls and data transfer

### 3. Cross-Platform Consistency
- Shared business logic (React Native/Flutter)
- Platform-specific UX where appropriate
- Maintain single codebase for iOS and Android

### 4. User Experience
- Native-feeling interactions
- Intuitive navigation
- Proper loading states
- Graceful error handling

## Technical Constraints

- **Framework**: React Native 0.72+ or Flutter 3.10+
- **Min iOS**: 14.0
- **Min Android**: API 26 (Android 8.0)
- **Bundle Size**: < 50MB download
- **Startup Time**: < 2s cold start

## Library Preferences

### React Native
- **Navigation**: React Navigation 6+
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Storage**: MMKV or AsyncStorage
- **Network**: Axios with interceptors

### Flutter
- **State**: Riverpod or Bloc
- **Navigation**: GoRouter
- **Storage**: Hive or sqflite
- **Network**: Dio with interceptors

## Architecture

- Feature-based modules
- Clean Architecture or MVVM
- Repository pattern for data
- Service layer for business logic

---

*Optimized for React Native and Flutter cross-platform development*
