import { useState, useRef, useEffect } from 'react';

export type ModalTab = 'profile' | 'apiKeys' | 'usage';

export function useUserMenu() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('profile');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const openModal = (tab: ModalTab) => {
    setActiveTab(tab);
    setIsModalOpen(true);
    setIsDropdownOpen(false); // Close dropdown when opening modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    // Dropdown state
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,

    // Modal state
    isModalOpen,
    activeTab,
    setActiveTab,
    openModal,
    closeModal,
  };
}
