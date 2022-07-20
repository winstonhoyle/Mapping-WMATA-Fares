import os
from dotenv import dotenv_values


class Config:
    def __init__(self, path: str):
        env_vals = dotenv_values(path)
        self.batch_account_name = env_vals.get('BATCH_ACCOUNT_NAME')
        self.batch_account_key = env_vals.get('BATCH_ACCOUNT_KEY')
        self.batch_account_url = env_vals.get('BATCH_ACCOUNT_URL')
        self.storage_account_name = env_vals.get('STORAGE_ACCOUNT_NAME')
        self.storage_account_key = env_vals.get('STORAGE_ACCOUNT_KEY')
        self.pool_id = env_vals.get('POOL_ID')
        self.pool_node_count = env_vals.get('POOL_NODE_COUNT')
        self.pool_vm_size = env_vals.get('POOL_VM_SIZE')
        self.job_id = env_vals.get('JOB_ID')
        self.standard_out_file_name = env_vals.get('STANDARD_OUT_FILE_NAME')
