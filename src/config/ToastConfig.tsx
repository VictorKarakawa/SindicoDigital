import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Colors } from '../constants/colors';
import { Typography, Spacing, BorderRadius } from '../constants/typography';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <View style={[styles.container, styles.success]}>
      <CheckCircle size={20} color={Colors.white} />
      <View style={styles.content}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 ? <Text style={styles.message}>{props.text2}</Text> : null}
      </View>
    </View>
  ),
  error: (props) => (
    <View style={[styles.container, styles.error]}>
      <AlertCircle size={20} color={Colors.white} />
      <View style={styles.content}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 ? <Text style={styles.message}>{props.text2}</Text> : null}
      </View>
    </View>
  ),
  info: (props) => (
    <View style={[styles.container, styles.info]}>
      <Info size={20} color={Colors.white} />
      <View style={styles.content}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 ? <Text style={styles.message}>{props.text2}</Text> : null}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginTop: 10,
  },
  content: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  success: {
    backgroundColor: Colors.success,
  },
  error: {
    backgroundColor: Colors.error,
  },
  info: {
    backgroundColor: Colors.primaryLight,
  },
  title: {
    color: Colors.white,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  message: {
    color: Colors.white,
    fontSize: Typography.xs,
    opacity: 0.9,
    marginTop: 2,
  },
});
