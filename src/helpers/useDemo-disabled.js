import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  DEMO_ADMIN,
  DEMO_DELIVERYMAN,
  DEMO_MANEGER,
  DEMO_MODERATOR,
  DEMO_SELLER,
  DEMO_SHOP,
  DEMO_SELLER_UUID,
} from '../configs/app-global';
import { useSelector } from 'react-redux';

export default function useDemo() {
  const { t } = useTranslation();
  const { settings } = useSelector((state) => state.globalSettings);
  const demoSeller = DEMO_SELLER;
  const demoSellerUuid = DEMO_SELLER_UUID;
  const demoDeliveryman = DEMO_DELIVERYMAN;
  const demoShop = DEMO_SHOP;
  const demoAdmin = DEMO_ADMIN;
  const demoModerator = DEMO_MODERATOR;
  const demoMeneger = DEMO_MANEGER;

  // DEMO MODE COMPLETELY DISABLED
  // Always return false regardless of environment or settings
  const isDemo = false;

  console.log('Demo mode DISABLED - always false:', {
    envDemo: false,
    settingsDemo: false,
    finalIsDemo: false,
    envVar: process.env.REACT_APP_IS_DEMO,
    settingsValue: settings?.is_demo,
    note: 'Demo mode has been completely disabled'
  });

  return {
    isDemo: false, // Always false
    demoFunc: () => {}, // Empty function - no warning
    demoSeller,
    demoDeliveryman,
    demoShop,
    demoAdmin,
    demoModerator,
    demoMeneger,
    demoSellerUuid,
  };
}