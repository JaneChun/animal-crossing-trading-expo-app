import React, { ReactNode } from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { showToast } from '@/components/ui/Toast';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { reportError } from '@/firebase/services/errorService';
import { Colors } from '@/theme/Color';

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	errorMessage: string | null;
	errorStack: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			errorMessage: null,
			errorStack: null,
		};
	}

	// UI 렌더링 중 에러가 발생 시 호출
	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			errorMessage: error.message,
			errorStack: error.stack ?? null,
		};
	}

	// 에러 발생 시 실행되는 메서드 (로그 출력)
	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('Error caught by ErrorBoundary:', `%c ${error}`, errorInfo);
	}

	resetError = () => {
		this.setState({ hasError: false, errorMessage: null, errorStack: null });
	};

	reportErrorToFirestore = async () => {
		try {
			await reportError(this.state.errorMessage ?? '', this.state.errorStack ?? '');

			showToast('success', '개발팀에 에러가 보고되었습니다.');
		} catch (e) {
			showToast('error', '에러 리포트 중 문제가 발생했습니다.');
		}
	};

	render() {
		if (this.state.hasError) {
			return (
				<ScrollView contentContainerStyle={styles.container}>
					<View style={styles.infoContainer}>
						<Text style={styles.title}>앱에 문제가 발생했습니다.</Text>
						<Button title="재시도" onPress={this.resetError} />
					</View>

					{/* 에러 리포트 버튼 */}
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={styles.toggleButton}
							onPress={this.reportErrorToFirestore}
						>
							<Text style={styles.toggleButtonText}>에러 리포트 보내기 📩</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
	infoContainer: {
		flex: 9,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.semibold,
	},
	toggleButton: {
		marginVertical: 10,
		paddingVertical: 8,
		paddingHorizontal: 15,
		borderRadius: 5,
	},
	toggleButtonText: {
		color: Colors.text.tertiary,
		fontSize: FontSizes.sm,
	},
	logContainer: {
		width: '100%',
		maxHeight: 300,
		padding: 10,
		gap: 8,
	},
	logText: {
		fontSize: FontSizes.xs,
		color: Colors.text.tertiary,
	},
});
