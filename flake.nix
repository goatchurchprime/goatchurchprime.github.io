{
  description = "Package the Spectrum analyser.";

  outputs = { self, nixpkgs }: {
    packages.x86_64-linux.specana =
      let pkgs = import nixpkgs {
            system = "x86_64-linux";
          };
      in pkgs.stdenv.mkDerivation {
        pname = "specana";
        version = "1.0.0";
        src = pkgs.fetchgit {
          url = "https://github.com/TheGoodDoktor/8BitAnalysers.git";
          rev = "301b982beccd0f13747e01f714a4a45fb7032dfe";
          fetchSubmodules = true;
          sha256 = "sha256-Uwxynx4+TQuExx+TpKL53pKR4meSEEdwbxOGy+Cz7Ow=";
        };


        nativeBuildInputs = with pkgs; [
          cmake
          python3
        ];
        buildInputs = with pkgs; [ glib libGL xorg.libX11 xorg.libXrandr xorg.libXinerama xorg.libXcursor xorg.libXi alsa-lib ]; 
        
        configurePhase = ''
            cd Source/ZXSpectrum
            mkdir build
            cd build
            export CXXFLAGS=-Wno-format-security
            cmake ..
          '';

          installPhase = ''
            mkdir -p $out/bin
            cp SpectrumAnalyser $out/bin
          '';

        meta = { 
           mainProgram = "SpectrumAnalyser";
        };  
      };

    # Specify the default package
    defaultPackage.x86_64-linux = self.packages.x86_64-linux.specana; 
    
  };
}


