export const contractProcessingWorkflow = {
    name: 'contract_processing_workflow',
    description: 'Process uploaded contract PDF: OCR -> Extract -> Update DB',
    version: 1,
    tasks: [
        {
            name: 'contract_ocr',
            taskReferenceName: 'contract_ocr_ref',
            inputParameters: {
                contractId: '${workflow.input.contractId}',
                fileName: '${workflow.input.fileName}',
            },
            type: 'SIMPLE',
        },
        {
            name: 'contract_extract',
            taskReferenceName: 'contract_extract_ref',
            inputParameters: {
                contractId: '${workflow.input.contractId}',
            },
            type: 'SIMPLE',
        },
    ],
    outputParameters: {
        contractId: '${workflow.input.contractId}',
    },
    schemaVersion: 2,
    restartable: true,
    workflowStatusListenerEnabled: false,
};
