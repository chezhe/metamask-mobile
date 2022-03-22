import React, { useEffect, useState } from 'react';
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	Image,
	InteractionManager,
	TouchableWithoutFeedback,
} from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import ActionModal from '../ActionModal';
import { fontStyles } from '../../../styles/common';
import Icon from 'react-native-vector-icons/FontAwesome';
import { strings } from '../../../../locales/i18n';
import Device from '../../../util/device';
import { whatsNew } from './whatsNewList';
import AsyncStorage from '@react-native-community/async-storage';
import { CURRENT_APP_VERSION, LAST_APP_VERSION, WHATS_NEW_APP_VERSION_SEEN } from '../../../constants/storage';
import compareVersions from 'compare-versions';
import PropTypes from 'prop-types';
import { findRouteNameFromNavigatorState } from '../../../util/general';
import StyledButton from '../StyledButton';
import { mockTheme, useAppThemeFromContext } from '../../../util/theme';
const modalMargin = 24;
const modalPadding = 24;
const screenWidth = Device.getDeviceWidth();
const screenHeight = Device.getDeviceHeight();
const slideItemWidth = screenWidth - modalMargin * 2;
const maxSlideItemHeight = screenHeight - 200;
const slideImageWidth = slideItemWidth - modalPadding * 2;
const imageAspectRatio = 128 / 264;
const slideImageHeight = slideImageWidth * imageAspectRatio;

const createStyles = (colors) =>
	StyleSheet.create({
		wrapper: {
			marginTop: 24,
			flex: 1,
			overflow: 'hidden',
		},
		slideContent: {
			maxHeight: maxSlideItemHeight,
		},
		slideItemContainer: {
			flex: 1,
			width: slideItemWidth,
			paddingHorizontal: modalPadding,
			paddingBottom: 16,
		},
		progessContainer: {
			flexDirection: 'row',
			alignSelf: 'center',
			marginTop: 16,
			marginBottom: 8,
		},
		slideCircle: {
			width: 8,
			height: 8,
			borderRadius: 8 / 2,
			backgroundColor: colors.icon.default,
			opacity: 0.4,
			marginHorizontal: 8,
		},
		slideSolidCircle: {
			opacity: 1,
		},
		button: {
			marginTop: 8,
		},
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 20,
			paddingHorizontal: modalPadding,
		},
		headerCenterAux: {
			flex: 1,
		},
		headerClose: {
			flex: 1,
			alignItems: 'flex-end',
		},
		headerText: {
			...fontStyles.bold,
			fontSize: 18,
			color: colors.text.default,
		},
		slideImageContainer: {
			flexDirection: 'row',
			borderRadius: 10,
			marginBottom: 24,
		},
		slideImage: {
			flex: 1,
			borderRadius: 10,
			width: slideImageWidth,
			height: slideImageHeight,
		},
		slideTitle: {
			...fontStyles.bold,
			fontSize: 16,
			marginBottom: 12,
			color: colors.text.default,
		},
		slideDescription: {
			...fontStyles.normal,
			fontSize: 14,
			lineHeight: 20,
			color: colors.text.default,
			marginBottom: 24,
		},
	});

const WhatsNewModal = (props) => {
	const [featuresToShow, setFeaturesToShow] = useState(null);
	const [show, setShow] = useState(false);
	const routes = useNavigationState((state) => state.routes);
	const slideIds = [0, 1];
	const [currentSlide, setCurrentSlide] = useState(slideIds[0]);
	const { colors } = useAppThemeFromContext() || mockTheme;
	const styles = createStyles(colors);

	useEffect(() => {
		const shouldShow = async () => {
			const whatsNewAppVersionSeen = await AsyncStorage.getItem(WHATS_NEW_APP_VERSION_SEEN);

			const currentAppVersion = await AsyncStorage.getItem(CURRENT_APP_VERSION);
			const lastAppVersion = await AsyncStorage.getItem(LAST_APP_VERSION);
			const isUpdate = !!lastAppVersion && currentAppVersion !== lastAppVersion;

			const seen =
				!!whatsNewAppVersionSeen &&
				compareVersions.compare(whatsNewAppVersionSeen, whatsNew.minAppVersion, '>=');

			if (seen) return;

			if (whatsNew.onlyUpdates) {
				const updatingCorrect = whatsNew.onlyUpdates && isUpdate;

				if (!updatingCorrect) return;

				const lastVersionCorrect = compareVersions.compare(lastAppVersion, whatsNew.maxLastAppVersion, '<');

				if (!lastVersionCorrect) return;
			}

			const versionCorrect = compareVersions.compare(currentAppVersion, whatsNew.minAppVersion, '>=');

			if (!versionCorrect) return;

			if (whatsNew.slides.length) setFeaturesToShow(true);
		};
		shouldShow();
	}, []);

	const closeModal = async () => {
		setFeaturesToShow(false);
		const version = await AsyncStorage.getItem(CURRENT_APP_VERSION);
		await AsyncStorage.setItem(WHATS_NEW_APP_VERSION_SEEN, version);
	};

	const callButton = (onPress) => {
		closeModal();
		onPress(props);
	};

	useEffect(() => {
		if (props.enabled && featuresToShow) {
			const route = findRouteNameFromNavigatorState(routes);
			if (route === 'WalletView') {
				InteractionManager.runAfterInteractions(() => {
					setShow(true);
				});
			}
		} else {
			setShow(false);
		}
	}, [featuresToShow, props.enabled, routes]);

	const renderSlideElement = (elementInfo) => {
		switch (elementInfo.type) {
			case 'title':
				return (element = <Text style={styles.slideTitle}>{elementInfo.title}</Text>);
			case 'description':
				return (element = <Text style={styles.slideDescription}>{elementInfo.description}</Text>);
			case 'image':
				return (
					<View style={styles.slideImageContainer}>
						<Image source={elementInfo.image} style={styles.slideImage} resizeMode={'stretch'} />
					</View>
				);
			case 'button':
				return (
					<View style={styles.button}>
						<StyledButton type={elementInfo.buttonType} onPress={() => callButton(elementInfo.onPress)}>
							{elementInfo.buttonText}
						</StyledButton>
					</View>
				);
		}
		return null;
	};

	const renderSlide = (slideInfo, index) => {
		const key = `slide-info-${index}`;
		return (
			<ScrollView key={key} style={styles.slideItemContainer}>
				<TouchableWithoutFeedback>
					<View>
						{slideInfo.map((elementInfo, elIndex) => {
							const elKey = `${key}-${elIndex}`;
							return <View key={elKey}>{renderSlideElement(elementInfo)}</View>;
						})}
					</View>
				</TouchableWithoutFeedback>
			</ScrollView>
		);
	};

	const onScrollEnd = (e) => {
		const xOffset = e.nativeEvent.contentOffset.x;
		const slideIndex = Math.round(xOffset / screenWidth);
		if (currentSlide === slideIndex) {
			return;
		}
		setCurrentSlide(slideIndex);
	};

	return (
		<ActionModal
			modalVisible={show}
			displayCancelButton={false}
			displayConfirmButton={false}
			verticalButtons
			propagateSwipe
		>
			<View style={styles.wrapper} testID={'whats-new-modal'}>
				<View>
					<View style={styles.header}>
						<View style={styles.headerCenterAux} />
						<Text style={styles.headerText}>{strings('whats_new.title')}</Text>
						<View style={styles.headerClose}>
							<TouchableOpacity
								onPress={closeModal}
								hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
							>
								<Icon name="times" size={16} color={colors.icon.default} />
							</TouchableOpacity>
						</View>
					</View>
					{featuresToShow && (
						<View style={styles.slideContent}>
							<ScrollView
								// This is not duplicate. Needed for Android.
								onScrollEndDrag={onScrollEnd}
								onMomentumScrollEnd={onScrollEnd}
								showsHorizontalScrollIndicator={false}
								horizontal
								pagingEnabled
							>
								{whatsNew.slides.map(renderSlide)}
							</ScrollView>
							<View style={styles.progessContainer}>
								{slideIds.map((id) => (
									<View
										key={id}
										style={[styles.slideCircle, currentSlide === id ? styles.slideSolidCircle : {}]}
									/>
								))}
							</View>
						</View>
					)}
				</View>
			</View>
		</ActionModal>
	);
};

WhatsNewModal.propTypes = {
	/**
	 * Showing the modal is enabled
	 */
	enabled: PropTypes.bool,
};

export default WhatsNewModal;
