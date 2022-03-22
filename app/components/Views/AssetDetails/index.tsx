import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getNetworkNavbarOptions } from '../../UI/Navbar';
import { mockTheme, useAppThemeFromContext } from '../../../util/theme';
import { fontStyles } from '../../../styles/common';
import ClipboardManager from '../../../core/ClipboardManager';
import { showAlert } from '../../../actions/alert';
import { strings } from '../../../../locales/i18n';
import { useDispatch } from 'react-redux';
import EthereumAddress from '../../UI/EthereumAddress';
import Icon from 'react-native-vector-icons/Feather';

const createStyles = (colors: any) =>
	StyleSheet.create({
		container: {
			padding: 16,
			backgroundColor: colors.background.default,
			alignItems: 'flex-start',
		},
		balanceContainer: { flexDirection: 'row', alignItems: 'center' },
		balanceAmountLabel: { ...(fontStyles.bold as any), fontSize: 32, color: colors.text.default },
		fiatAmountLabel: { ...(fontStyles.normal as any), fontSize: 16, color: colors.text.alternative },
		tokenImage: { height: 26, width: 26 },
		sectionTitleLabel: {
			...(fontStyles.bold as any),
			fontSize: 16,
			color: colors.text.default,
			marginTop: 32,
		},
		sectionDescription: {
			...(fontStyles.normal as any),
			fontSize: 16,
			color: colors.text.default,
			marginTop: 4,
		},
		hideButton: {
			marginTop: 48,
		},
		hideButtonLabel: {
			...(fontStyles.normal as any),
			fontSize: 16,
			color: colors.error.default,
		},
		addressLinkContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			marginTop: 4,
		},
		addressLinkLabel: {
			...(fontStyles.normal as any),
			fontSize: 16,
			color: colors.primary.default,
		},
		copyIcon: {
			marginLeft: 4,
			color: colors.primary.default,
		},
	});

const AssetDetails = () => {
	const navigation = useNavigation();
	const { colors } = useAppThemeFromContext() || mockTheme;
	const styles = createStyles(colors);
	const dispatch = useDispatch();

	useEffect(() => {
		navigation.setOptions(getNetworkNavbarOptions('Token Details', false, navigation, colors));
	}, [colors, navigation]);

	const copyAddressToClipboard = async () => {
		await ClipboardManager.setString('address');
		dispatch(
			showAlert({
				isVisible: true,
				autodismiss: 1500,
				content: 'clipboard-alert',
				data: { msg: strings('detected_tokens.address_copied_to_clipboard') },
			})
		);
	};

	const renderBalanceSection = () => (
		<>
			<View style={styles.balanceContainer}>
				<Text style={styles.balanceAmountLabel}>{'200'}</Text>
				<Image source={{}} style={styles.tokenImage} />
			</View>
			<Text style={styles.fiatAmountLabel}>{'$2231.21'}</Text>
		</>
	);

	const renderSectionTitle = (title: string) => <Text style={styles.sectionTitleLabel}>{title}</Text>;

	const renderSectionDescription = (description: string) => (
		<Text style={styles.sectionDescription}>{description}</Text>
	);

	const renderHideButton = () => (
		<TouchableOpacity hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }} style={styles.hideButton}>
			<Text style={styles.hideButtonLabel}>{'Hide token'}</Text>
		</TouchableOpacity>
	);

	const renderTokenAddressLink = () => (
		<TouchableOpacity
			hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
			onPress={copyAddressToClipboard}
			style={styles.addressLinkContainer}
		>
			<EthereumAddress style={styles.addressLinkLabel} address={'address'} type={'short'} />
			<Icon style={styles.copyIcon} name={'copy'} size={16} />
		</TouchableOpacity>
	);

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{renderBalanceSection()}
			{renderSectionTitle('Token contract address')}
			{renderTokenAddressLink()}
			{renderSectionTitle('Token decimal')}
			{renderSectionDescription('18')}
			{renderSectionTitle('Network')}
			{renderSectionDescription('Ethereum Mainnet')}
			{renderSectionTitle('Token lists')}
			{renderSectionDescription('AirswapLight, Bancor, CMC, CoinGecko, Zerion, Kleros')}
			{renderHideButton()}
		</ScrollView>
	);
};

export default AssetDetails;
