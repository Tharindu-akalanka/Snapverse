import type {Metadata} from 'next';
import SelectApp from './select-app';
import './proofing.css';
export const metadata:Metadata={title:'Snappers by SnapVerse | Client Selections',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function SelectPage(){return <div className="proofing-root"><SelectApp/></div>;}
