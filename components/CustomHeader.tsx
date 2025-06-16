import { Href, useRouter } from 'expo-router';
import { BackHandler } from 'react-native';
import { Appbar } from 'react-native-paper';

type CustomHeaderProps = {
  title: string;
  backRoute: string
};

const CustomHeader = ({ title, backRoute }: CustomHeaderProps) => {
  const router = useRouter();
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={() => router.push(backRoute as Href)} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export default CustomHeader;