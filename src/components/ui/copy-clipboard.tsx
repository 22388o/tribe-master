import React, { useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import { Check } from '@/components/icons/check';
import { Copy } from '@/components/icons/copy';
import { toast} from 'react-toastify'
import { shortenStr } from '@/utils/utils';
type CopyClipboardProps = {
  text: string;
  fulltext?: boolean;
};

const CopyClipboard: React.FC<CopyClipboardProps> = ({ text , fulltext = false}) => {
  const [copyButtonStatus, setCopyButtonStatus] = useState(false);
  const [_, copyToClipboard] = useCopyToClipboard();
  function handleCopyToClipboard() {
    if (text) {
      copyToClipboard(text);
      toast.info(`${shortenStr(text)} copied to clipboard`)
      setCopyButtonStatus(true);
      setTimeout(() => {
        setCopyButtonStatus(copyButtonStatus);
      }, 2500);
    }
  }

  return (
    <div
      title="Copy text"
      className="flex cursor-pointer items-center text-gray-500 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      onClick={handleCopyToClipboard}
    >
      {fulltext ? text : shortenStr(text)}
      {copyButtonStatus ? (
        <Check className="ml-4 h-auto w-3.5 text-green-500" />
      ) : (
        <Copy className="ml-4 h-auto w-3.5" />
      )}
    </div>
  );
};

export default CopyClipboard;
