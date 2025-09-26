import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#1f2937',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  ml10: {
    marginLeft: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 8,
    color: '#065f46',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#1f2937',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
  },
  modalButton: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  textButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  
  // New camera-related styles
  photoSection: {
    marginBottom: 20,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  photoPreview: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  photoActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  removePhotoButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  identifyButton: {
    flex: 2,
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  identifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Species identification progress styles
  identificationProgress: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  progressIcon: {
    marginRight: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#3730a3',
    flex: 1,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6366f1',
    marginLeft: 8,
  },
  acceptButton: {
    marginTop: 8,
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});