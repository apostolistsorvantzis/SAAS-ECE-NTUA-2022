import { userStore } from '@/stores/userStore';

export function setUserState(user) {
  const userState = userStore();

  userState.id = user.id;
  userState.token = user.token;
  userState.email = user.email;
  userState.isLoggedIn = user.isLoggedIn;
  userState.hasActiveSubscription = user.hasActiveSubscription;
  userState.subscriptionStartDate = user.subscriptionStartDate;
  userState.subscriptionEndDate = user.subscriptionEndDate;

  // Also update the localStorage
  localStorage.setItem('id', user.id);
  localStorage.setItem('token', user.token);
  localStorage.setItem('email', user.email);
  localStorage.setItem('isLoggedIn', user.isLoggedIn);
  localStorage.setItem('hasActiveSubscription', user.hasActiveSubscription);
  localStorage.setItem('subscriptionStartDate', user.subscriptionStartDate);
  localStorage.setItem('subscriptionEndDate', user.subscriptionEndDate);

  return userState;
}

export function cleanUserState() {
  const userState = userStore();

  userState.id = null;
  userState.type = null;
  userState.token = null;
  userState.email = null;
  userState.isLoggedIn = false;
  userState.hasActiveSubscription = false;
  userState.subscriptionStartDate = null;
  userState.subscriptionEndDate = null;

  // Also update the localStorage
  localStorage.removeItem('id');
  localStorage.removeItem('type');
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('hasActiveSubscription');
  localStorage.removeItem('subscriptionStartDate');
  localStorage.removeItem('subscriptionEndDate');

  return userState;
}
