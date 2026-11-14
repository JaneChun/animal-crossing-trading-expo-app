import { FontAwesome6 } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import ContentTypeChip from '@/components/Admin/ContentTypeChip';
import DangerActionPanel from '@/components/Admin/DangerActionPanel';
import InfoRow from '@/components/Admin/InfoRow';
import StatCard from '@/components/Admin/StatCard';
import StatStrip from '@/components/Admin/StatStrip';
import StatTile from '@/components/Admin/StatTile';
import SummaryLinkCard from '@/components/Admin/SummaryLinkCard';
import UserRow from '@/components/Admin/UserRow';
import ViewAllLink from '@/components/Admin/ViewAllLink';
import Badge from '@/components/ui/Badge';
import Banner from '@/components/ui/Banner';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import {
	BorderRadius,
	Shadow,
	Spacing,
	TextVariants,
	Theme,
	useTheme,
	useThemedStyles,
} from '@/theme';
import { BadgeTone, BannerProps, ButtonVariant } from '@/types/components';

const BADGE_TONES: BadgeTone[] = [
	'red',
	'orange',
	'yellow',
	'green',
	'blue',
	'lavender',
	'purple',
	'brand',
	'neutral',
	'danger',
];
const BUTTON_VARIANTS: ButtonVariant[] = [
	'primary',
	'outline',
	'secondary',
	'ghost',
	'danger',
	'dangerOutline',
];
const SHADOW_KEYS = ['sm', 'md', 'lg'] as const;
// 실제로 쓰는 조합: 일괄 등록 결과 3종, 관리자 게시글 상태 2종
const BANNER_SAMPLES: Omit<BannerProps, 'containerStyle'>[] = [
	{ tone: 'brand', icon: 'search', text: '아이템 3개를 찾았어요' },
	{ tone: 'yellow', icon: 'alert-circle', text: '맞는 아이템을 골라주세요' },
	{ tone: 'red', icon: 'help-circle', text: '찾지 못한 텍스트예요' },
	{ tone: 'danger', icon: 'trash-2', text: '작성자가 삭제한 게시글' },
	{ tone: 'yellow', icon: 'eye-off', text: '관리자가 숨긴 게시글' },
];
const SAMPLE_USER = { displayName: '닉네임', islandName: '섬 이름' };
const noop = () => {};

type ColorTokens = { [key: string]: string | ColorTokens };

// { bg: { primary: '#fff' } } → [['bg.primary', '#fff']]
const flattenColors = (tokens: ColorTokens, prefix = ''): [string, string][] =>
	Object.entries(tokens).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		return typeof value === 'string' ? [[path, value]] : flattenColors(value, path);
	});

// 개발용 화면: 현재 테마의 토큰과 공통 컴포넌트를 주요 props 조합별로 보여 준다.
// 기기의 다크 모드 설정을 그대로 따르고, 화면 안에서 테마를 바꾸지 않는다
const DesignSystem = () => {
	return (
		<AdminGuard>
			<DesignSystemContent />
		</AdminGuard>
	);
};

const DesignSystemContent = () => {
	const { colors, scheme } = useTheme();
	const styles = useThemedStyles(makeStyles);
	const colorEntries = flattenColors(colors as unknown as ColorTokens);

	return (
		<ScrollView style={styles.screen}>
			<Section title="색상" description={`useTheme().colors · 현재 테마(${scheme})`}>
				<View style={styles.grid}>
					{colorEntries.map(([name, value]) => (
						<View key={name} style={styles.colorItem}>
							<View style={[styles.swatch, { backgroundColor: value }]} />
							<View style={styles.flexShrink}>
								<Text variant="body2" weight="medium" numberOfLines={1}>
									{name}
								</Text>
								<Text variant="caption" color="tertiary">
									{value}
								</Text>
							</View>
						</View>
					))}
				</View>
			</Section>

			<Section title="Badge" description="tone · text.{tone} + bg.{tone} 쌍">
				<View style={styles.wrapRow}>
					{BADGE_TONES.map((tone) => (
						<Badge key={tone} text={tone} tone={tone} />
					))}
				</View>
			</Section>

			<Section title="Banner" description="tone(Badge와 같은 쌍) + Feather 아이콘 + 한 줄 문구">
				<View style={styles.stack}>
					{BANNER_SAMPLES.map((sample) => (
						<Banner key={sample.text} {...sample} />
					))}
				</View>
			</Section>

			<Section title="Text" description="variant · 크기 / 행간">
				{Object.entries(TextVariants).map(([variant, { fontSize, lineHeight }]) => (
					<View key={variant} style={styles.typeRow}>
						<Text variant={variant as keyof typeof TextVariants}>{variant}</Text>
						<Text variant="caption" color="tertiary">
							{`${fontSize} / ${lineHeight}`}
						</Text>
					</View>
				))}
			</Section>

			<Section title="Button" description="variant · size md(40)">
				<View style={styles.grid}>
					{BUTTON_VARIANTS.map((variant) => (
						<View key={variant} style={styles.gridCell}>
							<Button variant={variant} onPress={noop}>
								{variant}
							</Button>
						</View>
					))}
				</View>
				<Button disabled onPress={noop} style={styles.topGap}>
					disabled
				</Button>
				<Button isLoading onPress={noop} style={styles.topGap}>
					isLoading
				</Button>
				<View style={[styles.sizeRow, styles.topGap]}>
					<Button size="sm" onPress={noop}>
						sm 32
					</Button>
					<Button size="md" onPress={noop}>
						md 40
					</Button>
					<Button size="lg" flex onPress={noop}>
						lg 52
					</Button>
				</View>
			</Section>

			<Section title="Spacing · BorderRadius">
				{Object.entries(Spacing).map(([name, value]) => (
					<View key={name} style={styles.spacingRow}>
						<Text variant="caption" color="tertiary" style={styles.spacingName}>
							{name}
						</Text>
						<View style={[styles.spacingBar, { width: value }]} />
						<Text variant="caption" color="secondary">
							{value}
						</Text>
					</View>
				))}
				<View style={[styles.wrapRow, styles.topGap]}>
					{Object.entries(BorderRadius)
						.filter(([name]) => name !== 'full')
						.map(([name, value]) => (
							<View key={name} style={styles.radiusItem}>
								<View style={[styles.radiusBox, { borderRadius: value }]} />
								<Text variant="caption" color="tertiary">
									{name}
								</Text>
							</View>
						))}
				</View>
			</Section>

			<Section title="Shadow" description="sm 카드 / md 플로팅 / lg 모달">
				<View style={styles.wrapRow}>
					{SHADOW_KEYS.map((key) => (
						<View key={key} style={[styles.shadowBox, Shadow[key]]}>
							<Text variant="caption">{key}</Text>
						</View>
					))}
				</View>
			</Section>

			<Section title="Divider" description="thin 리스트 구분 / section 섹션 구분">
				<Divider />
				<Divider variant="section" style={styles.topGap} />
			</Section>

			<Section title="ContentTypeChip">
				<View style={styles.wrapRow}>
					<ContentTypeChip type="post" />
					<ContentTypeChip type="comment" />
					<ContentTypeChip type="reply" />
					<ContentTypeChip type="chat" />
					<ContentTypeChip type="profile" />
				</View>
			</Section>

			<Section title="StatCard" description="delta: 증가 status.danger / 감소 status.info">
				<View style={styles.sizeRow}>
					<StatCard
						label="증가"
						value="412"
						icon="textsms"
						tone="primaryBrand"
						delta={56}
					/>
					<StatCard label="감소" value="17" icon="star" tone="yellow" delta={-3} />
				</View>
			</Section>

			<Section title="StatStrip" description="아이콘 top(원형 tone 배경) | inline(숫자 앞)">
				<StatStrip
					items={[
						{ label: '게시글', value: '32', icon: { name: 'article', tone: 'blue' } },
						{
							label: '댓글',
							value: '120',
							icon: { name: 'mode-comment', tone: 'green' },
						},
						{ label: '답글', value: '45', icon: { name: 'reply', tone: 'lavender' } },
					]}
				/>
				<View style={styles.topGap}>
					<StatStrip
						items={[
							{ label: '기본', value: '17' },
							{
								label: 'inline',
								value: '11',
								inlineIcon: (
									<FontAwesome6
										name="smile-beam"
										size={18}
										color={colors.icon.green}
									/>
								),
							},
							{ label: 'valueTone', value: '6', valueTone: 'danger' },
						]}
					/>
				</View>
			</Section>

			<Section title="UserRow" description="right 슬롯: chevron | badge | 시간">
				<UserRow user={SAMPLE_USER} right={<Badge text="12.02까지 정지" tone="danger" />} />
				<UserRow
					user={SAMPLE_USER}
					nameAccessory={<Badge text="관리자" tone="brand" />}
					right={
						<Text variant="caption" color="tertiary">
							방금 전
						</Text>
					}
				/>
			</Section>

			<Section title="InfoRow" description="SettingListItem의 값 표시형">
				<InfoRow borderRound="top" label="문자열 값" value="2025.08.02" />
				<InfoRow
					borderRound="bottom"
					label="Badge 값"
					value={<Badge text="수신 가능" tone="green" />}
				/>
			</Section>

			<Section
				title="DangerActionPanel"
				description="bg.danger 면 · Button sm(dangerOutline | danger)"
			>
				<DangerActionPanel
					actions={[
						{
							title: '되돌리는 조치',
							description: '설명 문구',
							actionLabel: '해제',
							variant: 'dangerOutline',
							onPress: noop,
						},
						{
							title: '새로 적용하는 조치',
							description: '설명 문구',
							actionLabel: '적용',
							variant: 'danger',
							onPress: noop,
						},
					]}
				/>
			</Section>

			<Section title="StatTile" description="valueTone(선택, 위험도)">
				<View style={styles.sizeRow}>
					<StatTile label="기본" value={9} unit="건" />
					<StatTile label="danger" value={7} unit="건" valueTone="danger" />
				</View>
			</Section>

			<Section title="SummaryLinkCard" description="왼쪽 슬롯 + 제목 + 민트 이동 아이콘">
				<SummaryLinkCard
					left={<Badge text="팔아요" tone="blue" />}
					title="제목"
					onPress={noop}
				/>
			</Section>

			<Section title="ViewAllLink" isLast>
				<ViewAllLink label="전체 보기" onPress={noop} />
			</Section>
		</ScrollView>
	);
};

const Section = ({
	title,
	description,
	isLast = false,
	children,
}: {
	title: string;
	description?: string;
	isLast?: boolean;
	children: ReactNode;
}) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<>
			<View style={styles.section}>
				<Text variant="heading" weight="semibold">
					{title}
				</Text>
				{!!description && (
					<Text variant="caption" color="tertiary">
						{description}
					</Text>
				)}
				<View style={styles.sectionBody}>{children}</View>
			</View>
			{!isLast && <Divider variant="section" />}
		</>
	);
};

export default DesignSystem;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		section: {
			padding: PADDING,
		},
		sectionBody: {
			marginTop: Spacing.l,
		},
		grid: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			rowGap: Spacing.m,
			columnGap: Spacing.s,
		},
		gridCell: {
			width: '48%',
		},
		colorItem: {
			width: '48%',
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
		},
		swatch: {
			width: 32,
			height: 32,
			borderRadius: BorderRadius.s,
			borderWidth: 1,
			borderColor: colors.border.default,
		},
		flexShrink: {
			flexShrink: 1,
		},
		wrapRow: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 6,
		},
		typeRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 10,
		},
		topGap: {
			marginTop: Spacing.m,
		},
		stack: {
			gap: Spacing.s,
		},
		sizeRow: {
			flexDirection: 'row',
			alignItems: 'flex-end',
			gap: Spacing.s,
		},
		spacingRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.m,
			marginBottom: 6,
		},
		spacingName: {
			width: 40,
		},
		spacingBar: {
			height: 12,
			borderRadius: Spacing.xxs,
			backgroundColor: colors.brand.primary,
		},
		radiusItem: {
			alignItems: 'center',
			gap: Spacing.xs,
			marginRight: Spacing.s,
		},
		radiusBox: {
			width: 52,
			height: 52,
			borderWidth: 1,
			borderColor: colors.brand.primary,
			backgroundColor: colors.bg.primaryBrand,
		},
		shadowBox: {
			width: 80,
			height: 52,
			marginRight: Spacing.l,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: BorderRadius.m,
			backgroundColor: colors.bg.elevated,
		},
	});
