import React from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCirlceIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

//Alert component for notifications and feedback
const Alert = ({
    type = 'info',
    title,
    message,
    onClose,
    className = '',
    actions = null
}) => {
    //Alert type configurations
    const alertTypes = {
        success: {
            bgColor: 'bg-safe-50',
            borderColor: 'border-safe-200',
            textColor: 'text-safe-800',
            iconColor: 'text-safe-500',
            icon: CheckCircleIcon
        },
        warning: {
            bgColor: 'bg-warning-50',
            borderColor: 'border-warning-200',
            textColor: 'text-warning-800',
            iconColor: 'text-warning-500',
            icon: ExclamationTriangleIcon
        },
        error: {
            bgColor: 'bg-danger-50',
            borderColor: 'border-danger-200',
            textColor: 'text-danger-800',
            iconColor: 'text-danger-500',
            icon: XCircleIcon
        },
        info: {
            bgColor: 'bg-medical-50',
            borderColor: 'border-medical-200',
            textColor: 'text-medical-800',
            iconColor: 'text-medical-500',
            icon: InformationCircleIcon
        }
    };

    const config = alertTypes[type];
    const IconComponent = config.icon;

    return (
        <div
            className={`
            rounded-lg border p-4
            ${config.bgcolour}
            ${config.borderColor}
            ${className}
            `}
            role="alert"
        >
            <div className="flex items-start">
                {/* Icon */}
                <div className="flex-shrink-0">
                    <IconComponent
                        className={`h-5 w-5 ${config.iconColor}`}
                        aria-hidden="true"
                    />
                </div>

                {/* Content */}
                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className={`text-sm font-medium ${config.textColor} mb-1`}>
                            {title}
                        </h3>
                    )}

                    {message && (
                        <div className={`text-sm ${config.textColor}`}>
                            {typeof message === 'string' ? (
                                <p>{message}</p>
                            ) : (
                                message
                            )}
                        </div>
                    )}
                    {/* Action buttons */}
                    {actions && (
                        <div className="mt-3">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Close button */}
                {onClose && (
                    <div className="ml-auto pl-3">
                        <button
                            type="button"
                            className={`
                inline-flex rounded-md p-1.5 
                ${config.textColor} 
                hover:bg-opacity-20 hover:bg-gray-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500
              `}
                            onClick={onClose}
                            aria-label="Close alert"
                        >
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

//alert components for common use cases
export const SuccessAlert = ({ title = "Success!", message, onClose, className = '' }) => {
    return (
        <Alert
            type="success"
            title={title}
            message={message}
            onClose={onClose}
            className={className}
        />

    );
};

//Warning for Dangerous actions
export const WarningAlert = ({ title = "Warning", message, onClose, className = '' }) => {
    return (
        <Alert
            type="warning"
            title={title}
            message={onClose}
            className={className}
        />
    );
};

//Drug conflict alert with severity-based styling
export const CpnflictAlert = ({ conflict, onClose }) => {
    const getSeverityConfig = (severity) => {
        switch (severity) {
            case 'major':
                return {
                    type: 'error',
                    title: 'Major Drug Interaction',
                    bgClass: 'bg-danger-50 border-danger-200'
                }

            case 'moderate':
                return {
                    type: 'warning',
                    title: 'Moderate drug interaction',
                    bgClass: 'bg-warning-50 border-warning-200'
                };

            case 'minor':
                return {
                    type: 'info',
                    title: 'Minor Drug Interaction',
                    bgClass: 'bg-medical-50 border-medical-200'
                };

            default:
                return {
                    type: 'info',
                    title: 'Drug Interaction',
                    bgClass: 'bg-gray-50 border-gray-200'
                };
        }
    };

    const config = getSeverityConfig(conflict.severity);

    return (
        <Alert
            type={config.type}
            title={config.title}
            className="mb-4"
            onClose={onClose}
            message={
                <div className="space-y-2" >
                    <p className="font-medium">
                        {conflict.medication1.name} + {conflict.medication2.name}
                    </p>
                    <p>{conflict.description}</p>
                    <div className="bg-white bg-opacity-50 rounded p-2">
                        <p className="text-sm font-medium">Recommendation:</p>
                        <p className="text-sm">{conflict.recommendation}</p>

                    </div>
                </div>
            }
            actions={
                <div className="flex space-x-2">
                    <button className="btn-primary text-xs py-1 px-2">
                        Contact Doctor
                    </button>
                    <button className="btn-secondary text-xs py-1 px-2">
                        Learn More
                    </button>
                </div>
            }
        />
    );
};

export default Alert;