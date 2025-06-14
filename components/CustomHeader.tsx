import { useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';

type CustomHeaderProps = {
  title: string;
};

const CustomHeader = ({ title }: CustomHeaderProps) => {
  const router = useRouter();
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={() => router.back()} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export default CustomHeader;