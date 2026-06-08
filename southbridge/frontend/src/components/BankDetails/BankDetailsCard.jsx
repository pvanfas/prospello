import React from 'react';
import { CreditCard, Edit, Trash2, Star, StarOff } from 'lucide-react';

const BankDetailsCard = ({ bank, onEdit, onDelete, onSetDefault }) => {
    return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{bank.account_holder_name}</h4>
                        <p className="text-sm text-gray-600">{bank.bank_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {(bank.is_default || bank.default) && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full border border-green-200">
                            <Star className="w-3 h-3 text-green-600 fill-green-600" />
                            <span className="text-xs font-semibold text-green-700">Default</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Account Number</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{bank.account_number}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">IFSC Code</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{bank.ifsc_code}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(bank)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
                    >
                        <Edit className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(bank.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                        <Trash2 className="w-3 h-3" />
                        Delete
                    </button>
                </div>
                
                {!(bank.is_default || bank.default) && (
                    <button
                        onClick={() => onSetDefault(bank.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
                    >
                        <StarOff className="w-3 h-3" />
                        Set Default
                    </button>
                )}
            </div>
        </div>
    );
};

export default BankDetailsCard;