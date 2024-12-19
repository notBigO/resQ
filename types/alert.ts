interface Alert {
  id: string;
  title: string;
  description: string;
  location: [number, number];
  requirments: string[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
}
