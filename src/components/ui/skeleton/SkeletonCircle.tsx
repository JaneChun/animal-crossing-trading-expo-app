import SkeletonBox from './SkeletonBox';

type Props = {
	size: number;
};

const SkeletonCircle = ({ size }: Props) => (
	<SkeletonBox width={size} height={size} borderRadius={size / 2} />
);

export default SkeletonCircle;
