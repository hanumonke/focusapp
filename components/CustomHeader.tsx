import globalStyles from '@/utils/globalStyles';
import { Href, useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';

type CustomHeaderProps = {
  title: string;
  backRoute: string, 
  addAction: () => (Promise<void> | void), 
  materialIcon: string, 
  refreshAction?: () => (Promise<void> | void)
};

const CustomHeader = ({ title, backRoute, addAction, materialIcon, refreshAction }: CustomHeaderProps) => {
  const router = useRouter();
  return (
    <Appbar.Header style={globalStyles.header}>
      <Appbar.BackAction onPress={() => router.push(backRoute as Href)} style={globalStyles.headerBackAction} />
      <Appbar.Content title={title} style={globalStyles.headerTitle} />
       {refreshAction && (
        <Appbar.Action icon="refresh" onPress={refreshAction} style={globalStyles.headerRefreshAction} />
      )}
      <Appbar.Action mode='outlined' icon={materialIcon} onPress={addAction} style={globalStyles.headerAddAction} />
    </Appbar.Header>
  );
};

export default CustomHeader;