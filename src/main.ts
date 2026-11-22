import './css/basic.css';
import './css/layout.css';

import { mountLayout } from './app/layout.ts';

const root = document.getElementById('app');
if (!root) throw new Error('#root не найден');

mountLayout(root, 'about', 0);
