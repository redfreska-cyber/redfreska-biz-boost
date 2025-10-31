import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="text-center space-y-8 px-4 max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Utensils className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          RedFreska
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
          Bienvenido a RedFreska — tu sistema de fidelización para restaurantes
        </p>
        
        <div className="pt-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/access")}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Comenzar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
