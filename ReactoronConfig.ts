import Reactotron from 'reactotron-react-native';

Reactotron.configure({
	name: 'Animal Crossing Trading App',
}) // controls connection & communication settings
	.useReactNative({
		asyncStorage: true,
	}) // add all built-in react native plugins
	.connect(); // let's connect!
