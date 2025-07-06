# features/formations/progression_service.py

from typing import List, Dict, Any
from src.supabase_client import supabase

class ProgressionService:
    """Service pour gérer la progression séquentielle dans les formations."""
    
    @staticmethod
    def get_accessible_modules(user_id: str, formation_id: int) -> List[int]:
        """
        Calcule quels modules sont accessibles pour un utilisateur dans une formation.
        Un module est accessible si :
        - C'est le premier module (index 0)
        - L'utilisateur a réussi le quiz du module précédent
        
        Returns:
            List[int]: Liste des IDs des modules accessibles
        """
        try:
            
            # 1. Récupérer tous les modules de la formation, triés par index
            modules_response = supabase.table('formation_modules').select(
                'modules(id, titre, index)'
            ).eq('formation_id', formation_id).execute()
            
            if not modules_response.data:
                return []
                
            # Extraire et trier les modules par index
            modules = [fm['modules'] for fm in modules_response.data if fm['modules']]
            modules = sorted(modules, key=lambda m: m.get('index', 0))
            
            
            
            if not modules:
                print("❌ Aucun module trouvé")
                return []
            
            # 2. Le premier module est toujours accessible
            accessible_modules = [modules[0]['id']]
            
            
            # 3. Pour chaque module suivant, vérifier si le quiz du module précédent est réussi
            for i in range(1, len(modules)):
                previous_module = modules[i-1]
                current_module = modules[i]
                
                
                
                # Vérifier si l'utilisateur a réussi le quiz du module précédent
                quiz_passed = ProgressionService._has_passed_module_quiz(user_id, previous_module['id'])
                
                
                if quiz_passed:
                    accessible_modules.append(current_module['id'])
                    
                else:
                    
                    # Si le quiz précédent n'est pas réussi, arrêter la progression
                    break
            
            
            return accessible_modules
            
        except Exception as e:
            print(f"Erreur lors du calcul des modules accessibles: {str(e)}")
            return []
    
    @staticmethod
    def _has_passed_module_quiz(user_id: str, module_id: int) -> bool:
        """
        Vérifie si l'utilisateur a réussi le quiz d'un module donné.
        
        Args:
            user_id (str): ID de l'utilisateur
            module_id (int): ID du module
            
        Returns:
            bool: True si l'utilisateur a réussi le quiz, False sinon
        """
        try:
            
            
            # 1. Récupérer le quiz du module
            quiz_response = supabase.table('quizzes').select('id, passing_score').eq(
                'module_id', module_id
            ).eq('is_active', True).execute()
            
            if not quiz_response.data:
                
                # Pas de quiz pour ce module = ne peut pas être réussi
                # Un module doit avoir un quiz pour débloquer le suivant
                return False
            
            quiz = quiz_response.data[0]
            quiz_id = quiz['id']
            passing_score = quiz['passing_score']
            
            # 2. Récupérer la meilleure tentative de l'utilisateur pour ce quiz
            attempts_response = supabase.table('user_quiz_attempts').select(
                'score, max_score, passed'
            ).eq('user_id', user_id).eq('quiz_id', quiz_id).not_.is_(
                'completed_at', 'null'
            ).order('score', desc=True).limit(1).execute()
            
            if not attempts_response.data:
                # Aucune tentative complétée = pas réussi
                return False
            
            best_attempt = attempts_response.data[0]
            
            # 3. Vérifier si le score est suffisant
            if best_attempt['passed']:
                return True
            
            # Calculer le pourcentage si 'passed' n'est pas fiable
            if best_attempt['max_score'] and best_attempt['max_score'] > 0:
                percentage = (best_attempt['score'] / best_attempt['max_score']) * 100
                return percentage >= passing_score
            
            return False
            
        except Exception as e:
            print(f"Erreur lors de la vérification du quiz: {str(e)}")
            return False
    
    @staticmethod
    def get_user_progress_summary(user_id: str, formation_id: int) -> Dict[str, Any]:
        """
        Récupère un résumé de la progression de l'utilisateur dans une formation.
        
        Returns:
            Dict contenant les informations de progression
        """
        try:
            # Récupérer tous les modules
            modules_response = supabase.table('formation_modules').select(
                'modules(id, titre, index)'
            ).eq('formation_id', formation_id).execute()
            
            modules = [fm['modules'] for fm in modules_response.data if fm['modules']]
            modules = sorted(modules, key=lambda m: m.get('index', 0))
            
            total_modules = len(modules)
            accessible_modules = ProgressionService.get_accessible_modules(user_id, formation_id)
            completed_modules = 0
            
            # Compter les modules complétés (ceux avec quiz réussi sauf le dernier accessible)
            for module in modules:
                if module['id'] in accessible_modules[:-1]:  # Exclure le dernier module accessible
                    if ProgressionService._has_passed_module_quiz(user_id, module['id']):
                        completed_modules += 1
            
            return {
                'total_modules': total_modules,
                'accessible_modules_count': len(accessible_modules),
                'completed_modules': completed_modules,
                'current_module_index': len(accessible_modules) - 1 if accessible_modules else 0,
                'progress_percentage': int((completed_modules / total_modules * 100)) if total_modules > 0 else 0
            }
            
        except Exception as e:
            print(f"Erreur lors du calcul du résumé de progression: {str(e)}")
            return {
                'total_modules': 0,
                'accessible_modules_count': 0,
                'completed_modules': 0,
                'current_module_index': 0,
                'progress_percentage': 0
            }