import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

type IconColor =
	| 'blue'
	| 'cream'
	| 'green'
	| 'mint'
	| 'navy'
	| 'olive'
	| 'purple'
	| 'red'
	| 'yellow';

interface UserContextValue {
	email: string;
	iconColor: IconColor;
	username: string;
	postContent: string;
	isLoading: boolean;
	setEmail: (value: string) => void;
	setIconColor: (value: IconColor) => void;
	setUsername: (value: string) => void;
	setPostContent: (value: string) => void;
	refreshProfile: () => Promise<void>;
}

type FetchProfile = () => Promise<{
	email?: string;
	iconColor?: IconColor;
	username?: string;
}>;

interface UserProviderProps {
	children: React.ReactNode;
	fetchProfile?: FetchProfile;
	initialEmail?: string;
	initialUsername?: string;
	initialIconColor?: IconColor;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({
	children,
	fetchProfile,
	initialEmail = '',
	initialUsername = '',
	initialIconColor = 'blue',
}) => {
	const [email, setEmail] = useState<string>(initialEmail);
	const [iconColor, setIconColor] = useState<IconColor>(initialIconColor);
	const [username, setUsername] = useState<string>(initialUsername);
	const [postContent, setPostContent] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const refreshProfile = useCallback(async () : Promise<void> => {
		if (!fetchProfile) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		try {
			const profile = await fetchProfile();
			if (profile.email !== undefined) setEmail(profile.email);
			if (profile.iconColor !== undefined) setIconColor(profile.iconColor);
			if (profile.username !== undefined) setUsername(profile.username);
		} catch (error) {
			// プロフィール取得に失敗した場合は既存の値を保持
			console.warn('Failed to refresh profile', error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchProfile]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (!isMounted) return;
			await refreshProfile();
		})();
		return () => {
			isMounted = false;
		};
	}, [refreshProfile]);

	const value = useMemo(
		() => ({
			email,
			iconColor,
			username,
			postContent,
			isLoading,
			setEmail,
			setIconColor,
			setUsername,
			setPostContent,
			refreshProfile,
		}),
		[email, iconColor, username, postContent, isLoading, refreshProfile]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextValue => {
	const ctx = useContext(UserContext);
	if (!ctx) {
		throw new Error('useUserContext must be used within a UserProvider');
	}
	return ctx;
};

export { UserContext };

export default UserProvider;
