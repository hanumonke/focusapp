import { Href, useRouter } from 'expo-router';
import { BackHandler } from 'react-native';
import { Appbar, IconButtonProps } from 'react-native-paper';

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
    <Appbar.Header>
      <Appbar.BackAction onPress={() => router.push(backRoute as Href)} />
      <Appbar.Content title={title} />
       {refreshAction && (
        <Appbar.Action icon="refresh" onPress={refreshAction} />
      )}
      <Appbar.Action mode='outlined' icon={materialIcon} onPress={addAction} />
    </Appbar.Header>
  );
};

export default CustomHeader;