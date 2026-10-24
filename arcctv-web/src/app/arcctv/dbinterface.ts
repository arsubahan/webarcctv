export interface Dbinterface {
}
export interface Dbinterface {
}
export interface Clientdb {
  clcode: String;
  cltype: String;
  clname: String;
  claddress: String;
  clcontactno: String;
  clemail: String;
  cldatereg: String;
  clpassword: String;
  clandtoken: string[];
  resetPasswordToken: String;
  resetPasswordExpires: Date;
}

export interface Visitdb {
  Usvisitorcd: String;
  Usvisitorno: Number;
}

export interface Videodb {
  vidclcode: String;
  vidcltype: String;
  vidip: String;
  vidloc: String;
  vidlocpub: String;
  vidwsport: String;
  viduserid: String;
  vidpassword: String;
  vidcamno: Number;
}

export interface Vidtypedb {
  cctvtypecode: String;
  cctvtypedesc: String;
}


export interface Locationdb {
  loccode: String;
  locdesc: String;
}

export interface slidedet {
  slno: Number;
  sldesc: String;
}

export interface Staffdb {
  
  UsStaffcd: String,
  UsPassword: String,
  UsStaffname: String,
  UsStaffAddress: String,
  UsHphone: String,
  Usemail: String,
//  Uslevel: String,
  resetPasswordToken: null;
  resetPasswordExpires: null;
}

export interface logindb {
  UsStaffcd: String;
  UsPassword: String;
}

export interface cllogindb {
  clcode: String;
  clpassword: String;
}


export interface authrunno {
  runno: Number;
}

export interface UploadedFile {
  id: number;
  filename: string;
  originalname: string;
  filepath: string;
  created_at: string;
}

export interface slidedet {
  slno: Number;
  sldesc: String;
}

export interface configdb {
  configcode: String;
  configdesc: String;
  configvalue: String;
} 