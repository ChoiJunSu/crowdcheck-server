export interface SecretsManagerResponse {
  ARN: string;
  Name: string;
  VersionId: string;
  SecretString: string;
  VersionStaged: string[];
  CreatedDate: Date;
}
