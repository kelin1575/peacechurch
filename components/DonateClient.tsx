"use client";

import { useState } from "react";
import { Copy, Check, Building2 } from "lucide-react";

interface Account {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  description?: string;
}

export default function DonateClient({ account, compact }: { account: Account; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
          copied ? "bg-green-500 text-white" : "bg-primary-700 text-white hover:bg-primary-800"
        }`}
      >
        {copied ? <><Check className="w-4 h-4" />복사됨!</> : <><Copy className="w-4 h-4" />계좌번호 복사</>}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900">{account.bankName}</p>
          {account.description && (
            <p className="text-xs text-gray-500">{account.description}</p>
          )}
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 mb-1">계좌번호</p>
        <p className="font-mono font-bold text-gray-900 text-lg">
          {account.accountNumber}
        </p>
        <p className="text-xs text-gray-500 mt-1">예금주: {account.accountHolder}</p>
      </div>
      <button
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          copied
            ? "bg-green-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            복사됨!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            계좌번호 복사
          </>
        )}
      </button>
    </div>
  );
}
