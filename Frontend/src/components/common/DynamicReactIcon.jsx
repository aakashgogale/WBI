import React from 'react';
import * as FiIcons from 'react-icons/fi';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';

const DynamicReactIcon = ({ name, className }) => {
  if (!name || typeof name !== 'string') return null;
  
  if (name.startsWith('Fi')) {
    const Icon = FiIcons[name];
    return Icon ? <Icon className={className} /> : null;
  }
  if (name.startsWith('Md')) {
    const Icon = MdIcons[name];
    return Icon ? <Icon className={className} /> : null;
  }
  if (name.startsWith('Fa')) {
    const Icon = FaIcons[name];
    return Icon ? <Icon className={className} /> : null;
  }
  
  return null;
};

export default DynamicReactIcon;
