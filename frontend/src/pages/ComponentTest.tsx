import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card, CardContent, CardHeader, CardTitle,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Switch,
  Badge,
  Progress,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Input,
  Label
} from '@/components/ui';

const ComponentTest = () => {
  const [activeTab, setActiveTab] = React.useState('tab1');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [switchValue, setSwitchValue] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState('option1');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Component Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Button Component</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Default Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge Component</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Default Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="destructive">Destructive Badge</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Component</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={25} />
            <Progress value={50} />
            <Progress value={75} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Switch Component</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Switch checked={switchValue} onCheckedChange={setSwitchValue} />
            <Label>Toggle me ({switchValue ? 'On' : 'Off'})</Label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="test-input">Test Input</Label>
            <Input id="test-input" placeholder="Type something..." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Component</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tabs Component</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab3">Tab 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <p>This is the content for Tab 1</p>
              </TabsContent>
              <TabsContent value="tab2">
                <p>This is the content for Tab 2</p>
              </TabsContent>
              <TabsContent value="tab3">
                <p>This is the content for Tab 3</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={() => setIsDialogOpen(true)}>Open Dialog</Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Test</DialogTitle>
            </DialogHeader>
            <p className="py-4">This is a test dialog to verify the Dialog component works correctly.</p>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default ComponentTest;
