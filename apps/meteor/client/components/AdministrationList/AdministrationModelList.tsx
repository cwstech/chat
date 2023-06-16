import { OptionTitle } from '@rocket.chat/fuselage';
import { useTranslation, useRoute, useMethod, useSetModal, useRole, useRouter } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import React from 'react';

import type { AccountBoxItem } from '../../../app/ui-utils/client/lib/AccountBox';
import { getUpgradeTabLabel, isFullyFeature } from '../../../lib/upgradeTab';
import RegisterWorkspaceModal from '../../views/admin/cloud/modals/RegisterWorkspaceModal';
import { useUpgradeTabParams } from '../../views/hooks/useUpgradeTabParams';
import Emoji from '../Emoji';
import ListItem from '../Sidebar/ListItem';

type AdministrationModelListProps = {
	accountBoxItems: AccountBoxItem[];
	showWorkspace: boolean;
	onDismiss: () => void;
};

const AdministrationModelList: FC<AdministrationModelListProps> = ({ accountBoxItems, showWorkspace, onDismiss }) => {
	const t = useTranslation();
	const { tabType, trialEndDate, isLoading } = useUpgradeTabParams();
	const shouldShowEmoji = isFullyFeature(tabType);
	const label = getUpgradeTabLabel(tabType);
	const isAdmin = useRole('admin');
	const setModal = useSetModal();

	const checkCloudRegisterStatus = useMethod('cloud:checkRegisterStatus');
	const result = useQuery(['admin/cloud/register-status'], async () => checkCloudRegisterStatus());
	const { workspaceRegistered } = result.data || {};

	const handleRegisterWorkspaceClick = (): void => {
		const handleModalClose = (): void => setModal(null);
		setModal(<RegisterWorkspaceModal onClose={handleModalClose} />);
	};

	const router = useRouter();
	const upgradeRoute = useRoute('upgrade');
	const cloudRoute = useRoute('cloud');
	const showUpgradeItem = !isLoading && tabType;

	return (
		<>
			<OptionTitle>{t('Administration')}</OptionTitle>
			<ul>
				{showUpgradeItem && (
					<ListItem
						icon='arrow-stack-up'
						role='listitem'
						text={
							<>
								{t(label)} {shouldShowEmoji && <Emoji emojiHandle=':zap:' />}
							</>
						}
						onClick={() => {
							upgradeRoute.push({ type: tabType }, trialEndDate ? { trialEndDate } : undefined);
							onDismiss();
						}}
					/>
				)}
				{isAdmin && (
					<ListItem
						icon='cloud-plus'
						role='listitem'
						text={workspaceRegistered ? t('Registration') : t('Register')}
						onClick={() => {
							if (workspaceRegistered) {
								cloudRoute.push({ context: '/' });
								onDismiss();
								return;
							}
							handleRegisterWorkspaceClick();
						}}
					/>
				)}
				{showWorkspace && (
					<ListItem
						icon='cog'
						role='listitem'
						text={t('Workspace')}
						onClick={() => {
							router.navigate('/admin');
							onDismiss();
						}}
					/>
				)}
				{accountBoxItems.length > 0 && (
					<>
						{accountBoxItems.map((item, key) => {
							const action = () => {
								if (item.href) {
									router.navigate(item.href);
								}
								onDismiss();
							};

							return <ListItem role='listitem' text={t(item.name)} icon={item.icon} onClick={action} key={item.name + key} />;
						})}
					</>
				)}
			</ul>
		</>
	);
};

export default AdministrationModelList;
